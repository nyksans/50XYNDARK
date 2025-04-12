import { toast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File): ValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Check file type
  if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF or image (JPG, PNG)',
    };
  }

  return { isValid: true };
};

export const validateFileContent = async (file: File): Promise<ValidationResult> => {
  try {
    // For images, check dimensions
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const img = await createImageBitmap(file);
      
      // Check minimum dimensions (e.g., 500x500 pixels)
      if (img.width < 500 || img.height < 500) {
        return {
          isValid: false,
          error: 'Image resolution is too low. Please upload a clearer image.',
        };
      }
      
      // Check maximum dimensions (e.g., 5000x5000 pixels)
      if (img.width > 5000 || img.height > 5000) {
        return {
          isValid: false,
          error: 'Image dimensions are too large. Please resize the image.',
        };
      }
    }
    
    // For PDFs, we could add additional validation here if needed
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate file content. Please try another file.',
    };
  }
};

export const validateCameraImage = async (blob: Blob): Promise<ValidationResult> => {
  // Convert blob to File for consistent validation
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
  
  // Reuse file validation logic
  const fileValidation = validateFile(file);
  if (!fileValidation.isValid) {
    return fileValidation;
  }
  
  // Additional camera-specific validation could be added here
  
  return { isValid: true };
};