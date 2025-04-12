import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    retryCount?: number;
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ApiError {
  message: string;
  status: number;
}

export interface Bill {
  id: string;
  billType: 'utility' | 'housing' | 'insurance' | 'subscription' | 'credit';
  companyName: string;
  billDate: string;
  dueDate: string;
  amount: number;
  accountNumber: string;
  usageSummary: string;
  status: 'processed' | 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  bills: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface BillsQuery {
  query?: string;
  type?: Bill['billType'] | 'all';
  dateRange?: 'month' | 'quarter' | 'year' | 'all';
  status?: Bill['status'] | 'all';
  sortBy?: 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor with retry logic
api.interceptors.request.use(
  async (config) => {
    // Add retry count to config if not present
    if (config.retryCount === undefined) {
      config.retryCount = 0;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;

    // Only retry on network errors or 5xx responses
    if (
      (error.message === 'Network Error' || (error.response?.status >= 500 && error.response?.status < 600)) &&
      config.retryCount < MAX_RETRIES
    ) {
      config.retryCount++;

      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
      await sleep(delay);

      return api(config);
    }

    const apiError: ApiError = {
      message: error.response?.data?.detail || 'An unexpected error occurred',
      status: error.response?.status || 500,
    };

    // Add debug information
    console.debug('Request failed:', {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      retryCount: config?.retryCount,
    });

    toast({
      title: 'Error',
      description: apiError.message,
      variant: 'destructive',
    });
    return Promise.reject(apiError);
  }
);

export const billsApi = {
  getBills: async (params: BillsQuery) => {
    const { data } = await api.get<PaginatedResponse<Bill>>('/bills', { params });
    return data;
  },
  getBill: async (id: string) => {
    const { data } = await api.get<Bill>(`/bills/${id}`);
    return data;
  },
  processBill: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Bill>('/bills/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  processMultipleBills: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await api.post('/bills/process-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  updateBill: async (id: string, data: Partial<Bill>) => {
    const response = await api.put<Bill>(`/bills/${id}`, data);
    return response;
  },
  deleteBill: (id: string) => api.delete(`/bills/${id}`),
};

export default api;