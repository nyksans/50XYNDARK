import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Camera, File, FileText, Plus, Upload, X } from "lucide-react";
import { validateFile, validateFileContent } from "@/lib/file-utils";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import billApi from "@/lib/bill-api";

const ScanBill = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (file: File | Blob) => {
      return billApi.processBill(file);
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      const extractedData = {
        billType: data.billType || 'N/A',
        companyName: data.companyName || 'N/A',
        billDate: data.billDate || 'N/A',
        dueDate: data.dueDate || 'N/A',
        amount: data.amount || 0,
        accountNumber: data.accountNumber || 'N/A',
        usageSummary: data.usageSummary || 'N/A'
      };
      setAnalyzedData(extractedData);
      toast({
        title: "Success",
        description: "Bill scanned successfully",
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      setFile(null);
      // Error will be handled by API client's interceptor
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length > 0) {
      await handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      toast({
        title: "Error",
        description: fileValidation.error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const contentValidation = await validateFileContent(file);
    if (!contentValidation.isValid) {
      toast({
        title: "Error",
        description: contentValidation.error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setFile(file);
    setIsLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not access camera. Please ensure you have granted camera permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setIsAnalyzing(true);
      stopCamera();
      await scanMutation.mutateAsync(blob);
    }, 'image/jpeg', 0.8);
  };

  const handleProcess = () => {
    if (!file) return;
    setIsAnalyzing(true);
    scanMutation.mutateAsync(file);
  };

  const resetScan = () => {
    setFile(null);
    setAnalysisComplete(false);
    setAnalyzedData(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Scan & Process Bill</h1>
            <p className="text-muted-foreground mb-8">
              Upload or capture a bill to automatically extract and process the information
            </p>
            
            <div className="glass-card p-6 mb-8">
              <div className="flex border-b border-border mb-6">
                <button
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'upload' 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setActiveTab('upload');
                    stopCamera();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </span>
                  {activeTab === 'upload' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </button>
                <button
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'camera' 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('camera')}
                >
                  <span className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Use Camera
                  </span>
                  {activeTab === 'camera' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </button>
              </div>
              
              {activeTab === 'upload' && (
                <div>
                  {!file && (
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          Drag & drop your file here
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Supports PDF, JPG, PNG files up to 10MB
                        </p>
                        
                        <label className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2 cursor-pointer">
                          <Plus className="h-4 w-4" />
                          Browse Files
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload} 
                          />
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {file && !analysisComplete && (
                    <div>
                      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                          <File className="h-6 w-6 text-primary mr-3" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button 
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={resetScan}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {!isAnalyzing && (
                        <button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-3 rounded-md transition-colors"
                          onClick={handleProcess}
                        >
                          Process Bill
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'camera' && (
                <div className="text-center">
                  {!isCameraActive && (
                    <div className="py-12">
                      <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Ready to Scan
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                        Position your bill in good lighting for best results
                      </p>
                      
                      <button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2"
                        onClick={startCamera}
                      >
                        <Camera className="h-4 w-4" />
                        Start Camera
                      </button>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full max-w-2xl mx-auto rounded-lg"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                        <button
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium px-4 py-2 rounded-full transition-colors"
                          onClick={stopCamera}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-2 rounded-full transition-colors"
                          onClick={captureImage}
                        >
                          Capture
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Analyzing your bill...</p>
                  <p className="text-muted-foreground">
                    Our AI is extracting information from your document
                  </p>
                </div>
              )}
              
              {analysisComplete && analyzedData && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <h3 className="font-medium">Extracted Information</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Bill Type
                        </label>
                        <input 
                          type="text" 
                          value={analyzedData.billType}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Company
                        </label>
                        <input 
                          type="text" 
                          value={analyzedData.companyName}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Bill Date
                        </label>
                        <input 
                          type="text" 
                          value={analyzedData.billDate}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Due Date
                        </label>
                        <input 
                          type="text" 
                          value={analyzedData.dueDate}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Amount Due
                        </label>
                        <input 
                          type="text" 
                          value={`$${analyzedData.amount.toFixed(2)}`}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Account Number
                        </label>
                        <input 
                          type="text" 
                          value={analyzedData.accountNumber || 'N/A'}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Usage Summary
                        </label>
                        <textarea 
                          value={analyzedData.usageSummary || 'N/A'}
                          rows={3}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          readOnly
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md transition-colors"
                        onClick={() => {
                          // Save to history logic here
                          toast({
                            title: "Success",
                            description: "Bill saved to history",
                          });
                        }}
                      >
                        Save to History
                      </button>
                      <button 
                        className="flex-1 border border-input hover:bg-muted text-foreground font-medium px-4 py-2 rounded-md transition-colors"
                        onClick={resetScan}
                      >
                        Scan New Bill
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Tips for Better Results</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span> 
                  Ensure good lighting when taking photos of bills
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span> 
                  Make sure all text is clearly visible and not cut off
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span> 
                  For best results, place bills on a dark, non-reflective surface
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span> 
                  Digital bills (PDFs) typically yield more accurate results
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScanBill;
