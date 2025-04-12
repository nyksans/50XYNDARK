from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import google.generativeai as genai
from datetime import datetime
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io
import json
import time
from filelock import FileLock

load_dotenv()

app = FastAPI()

# Configure CORS with additional Vite ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Default Vite port
        "http://127.0.0.1:3000",
        "http://localhost:8083",
        "http://127.0.0.1:8083",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Configure Gemini AI
try:
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini AI configured successfully.")
except Exception as e:
    print(f"CRITICAL: Error configuring Gemini AI: {e}")
    model = None

# Excel file configuration
EXCEL_FILE = "bills.xlsx"
EXCEL_LOCK_FILE = "bills.xlsx.lock"
MAX_RETRIES = 3
RETRY_DELAY = 1

def safe_excel_operation(operation):
    """Decorator for safe Excel file operations with retries"""
    async def wrapper(*args, **kwargs):
        lock = FileLock(EXCEL_LOCK_FILE, timeout=10)  # 10 second timeout
        
        for attempt in range(MAX_RETRIES):
            try:
                with lock:
                    # Initialize Excel file if it doesn't exist
                    if not os.path.exists(EXCEL_FILE):
                        df = pd.DataFrame(columns=[
                            "id", "billType", "companyName", "billDate", "dueDate", 
                            "amount", "accountNumber", "usageSummary", "status", 
                            "createdAt", "updatedAt"
                        ])
                        df.to_excel(EXCEL_FILE, index=False)
                    
                    # Perform the actual operation
                    result = await operation(*args, **kwargs)
                    return result
                    
            except FileNotFoundError:
                raise HTTPException(
                    status_code=500,
                    detail="Excel file not found or inaccessible"
                )
            except PermissionError:
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY)
                    continue
                raise HTTPException(
                    status_code=503,
                    detail="Excel file is locked by another process"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Excel operation failed: {str(e)}"
                )
    return wrapper

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

async def analyze_bill_with_gemini(image: Image.Image) -> dict:
    """Analyze bill image using Gemini Vision API"""
    if not model:
        raise HTTPException(
            status_code=500,
            detail="Gemini AI not configured. Please check GOOGLE_API_KEY environment variable."
        )

    try:
        # Convert image to JPEG format
        buffered = io.BytesIO()
        if image.mode in ('RGBA', 'LA'):
            # Convert RGBA images to RGB to avoid Gemini API issues
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        
        image.save(buffered, format='JPEG', quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode()

        print(f"Processing image of size: {len(img_str)} bytes")

        prompt = """Analyze this bill image and extract the following information in JSON format.
        Follow these rules strictly:
        1. billType must be one of: utility, housing, insurance, subscription, credit
        2. Dates must be in YYYY-MM-DD format
        3. amount must be a number without currency symbols
        4. Include relevant usage details in usageSummary (e.g. kWh for electricity)
        5. All fields are required, use null if not found
        
        Required JSON format:
        {
            "billType": "<type>",
            "companyName": "<company>",
            "billDate": "<YYYY-MM-DD>",
            "dueDate": "<YYYY-MM-DD>",
            "amount": <number>,
            "accountNumber": "<number>",
            "usageSummary": "<summary>"
        }"""

        response = model.generate_content([
            prompt,
            {"inlineData": {"mimeType": "image/jpeg", "data": img_str}}
        ])
        
        if not response or not response.text:
            raise ValueError("Empty response from Gemini API")
            
        print(f"Raw Gemini response: {response.text[:200]}...")
        
        json_str = response.text.strip()
        if '```json' in json_str:
            json_str = json_str.split('```json')[1].split('```')[0].strip()
        elif '```' in json_str:
            json_str = json_str.split('```')[1].strip()
            
        data = json.loads(json_str)
        
        # Clean up amount if it's a string
        if isinstance(data.get('amount'), str):
            data['amount'] = float(data['amount'].replace('₹', '').replace('$', '').replace('€', '').replace(',', '').strip())
            
        # Ensure dates are in correct format
        for date_field in ['billDate', 'dueDate']:
            if date_field in data and data[date_field]:
                try:
                    parsed_date = pd.to_datetime(data[date_field])
                    data[date_field] = parsed_date.strftime('%Y-%m-%d')
                except:
                    print(f"Failed to parse {date_field}: {data[date_field]}")
                    data[date_field] = None

        # Validate bill type
        valid_types = {'utility', 'housing', 'insurance', 'subscription', 'credit'}
        if data.get('billType') not in valid_types:
            print(f"Invalid billType: {data.get('billType')}")
            data['billType'] = None

        # Ensure all required fields exist
        required_fields = ['billType', 'companyName', 'billDate', 'dueDate', 'amount', 'accountNumber', 'usageSummary']
        for field in required_fields:
            if field not in data or data[field] is None:
                print(f"Missing required field: {field}")
                data[field] = None
                    
        return data
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {str(e)}\nRaw response: {response.text if response else 'No response'}")
        raise HTTPException(
            status_code=422,
            detail="Failed to parse Gemini API response. Please try again with a clearer image."
        )
    except Exception as e:
        print(f"Gemini analysis error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to analyze bill: {str(e)}"
        )

@app.post("/api/bills/process")
@safe_excel_operation
async def process_bill(file: UploadFile = File(...)):
    try:
        # Read and validate the file
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds maximum limit of 10MB"
            )

        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail=f"Invalid file type. Allowed types are: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Process image with PIL
        image = Image.open(io.BytesIO(contents))
        
        # Analyze bill with Gemini
        analysis_result = await analyze_bill_with_gemini(image)
        
        # Prepare bill data for storage
        bill_data = {
            "id": str(pd.Timestamp.now().timestamp()),
            **analysis_result,
            "status": "processed",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }

        # Save to Excel
        df = pd.read_excel(EXCEL_FILE)
        df = pd.concat([df, pd.DataFrame([bill_data])], ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False)

        return bill_data

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        await file.close()

@app.post("/api/bills/process-multiple")
@safe_excel_operation
async def process_multiple_bills(files: list[UploadFile]):
    try:
        results = []
        errors = []

        for file in files:
            try:
                # Read and validate each file
                contents = await file.read()
                if len(contents) > MAX_FILE_SIZE:
                    errors.append({
                        "filename": file.filename,
                        "error": "File size exceeds maximum limit of 10MB"
                    })
                    continue

                file_ext = os.path.splitext(file.filename)[1].lower()
                if file_ext not in ALLOWED_EXTENSIONS:
                    errors.append({
                        "filename": file.filename,
                        "error": f"Invalid file type. Allowed types are: {', '.join(ALLOWED_EXTENSIONS)}"
                    })
                    continue

                # Process image with PIL
                image = Image.open(io.BytesIO(contents))
                
                # Analyze bill with Gemini
                analysis_result = await analyze_bill_with_gemini(image)
                
                # Prepare bill data for storage
                bill_data = {
                    "id": str(pd.Timestamp.now().timestamp()),
                    **analysis_result,
                    "status": "processed",
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }

                results.append({
                    "filename": file.filename,
                    "data": bill_data
                })

            except Exception as e:
                errors.append({
                    "filename": file.filename,
                    "error": str(e)
                })
            finally:
                await file.close()

        # Save successful results to Excel
        if results:
            df = pd.read_excel(EXCEL_FILE)
            new_bills = pd.DataFrame([r["data"] for r in results])
            df = pd.concat([df, new_bills], ignore_index=True)
            df.to_excel(EXCEL_FILE, index=False)

        return {
            "success": results,
            "errors": errors,
            "totalProcessed": len(results),
            "totalErrors": len(errors)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.get("/api/bills")
@safe_excel_operation
async def get_bills(
    query: str = None,
    type: str = None,
    dateRange: str = None,
    status: str = None,
    sortBy: str = "date",
    sortOrder: str = "desc",
    page: int = 1,
    limit: int = 10
):
    try:
        df = pd.read_excel(EXCEL_FILE)
        
        # Apply filters
        if query:
            df = df[
                df["companyName"].str.contains(query, case=False, na=False) |
                df["accountNumber"].str.contains(query, case=False, na=False)
            ]
        
        if type and type != "all":
            df = df[df["billType"] == type]
            
        if status and status != "all":
            df = df[df["status"] == status]
            
        if dateRange and dateRange != "all":
            now = pd.Timestamp.now()
            if dateRange == "month":
                start_date = now - pd.DateOffset(months=1)
            elif dateRange == "quarter":
                start_date = now - pd.DateOffset(months=3)
            elif dateRange == "year":
                start_date = now - pd.DateOffset(years=1)
            df = df[pd.to_datetime(df["createdAt"]) >= start_date]

        # Sort
        ascending = sortOrder == "asc"
        if sortBy == "date":
            df = df.sort_values("billDate", ascending=ascending)
        elif sortBy == "amount":
            df = df.sort_values("amount", ascending=ascending)
        elif sortBy == "name":
            df = df.sort_values("companyName", ascending=ascending)
        
        # Pagination
        total = len(df)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        df = df.iloc[start_idx:end_idx]
        
        return {
            "bills": df.to_dict("records"),
            "pagination": {
                "total": total,
                "page": page,
                "totalPages": (total + limit - 1) // limit
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bills/{bill_id}")
@safe_excel_operation
async def get_bill(bill_id: str):
    try:
        df = pd.read_excel(EXCEL_FILE)
        bill = df[df["id"] == bill_id].to_dict("records")
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return bill[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/bills/{bill_id}")
@safe_excel_operation
async def update_bill(bill_id: str, bill_data: dict):
    try:
        df = pd.read_excel(EXCEL_FILE)
        if not any(df["id"] == bill_id):
            raise HTTPException(status_code=404, detail="Bill not found")
            
        bill_data["updatedAt"] = datetime.now().isoformat()
        df.loc[df["id"] == bill_id, bill_data.keys()] = bill_data.values()
        df.to_excel(EXCEL_FILE, index=False)
        
        return {"message": "Bill updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/bills/{bill_id}")
@safe_excel_operation
async def delete_bill(bill_id: str):
    try:
        df = pd.read_excel(EXCEL_FILE)
        if not any(df["id"] == bill_id):
            raise HTTPException(status_code=404, detail="Bill not found")
            
        df = df[df["id"] != bill_id]
        df.to_excel(EXCEL_FILE, index=False)
        
        return {"message": "Bill deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)