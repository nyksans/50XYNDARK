import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { billsApi, type Bill, type BillsQuery, type PaginatedResponse } from '@/lib/api-client';

export interface BillStats {
  totalBills: number;
  totalSpent: number;
  timeSaved: number;
  monthlyTrend: number;
}

export const useBills = (initialQuery: BillsQuery = { page: 1, limit: 10 }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Bill>['pagination']>({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [query, setQuery] = useState<BillsQuery>(initialQuery);
  const [stats, setStats] = useState<BillStats>({
    totalBills: 0,
    totalSpent: 0,
    timeSaved: 0,
    monthlyTrend: 0
  });

  const fetchBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const { bills: billsData, pagination: paginationData } = await billsApi.getBills(query);
      setBills(billsData);
      setPagination(paginationData);
      
      // Calculate stats
      const totalSpent = billsData.reduce((sum, bill) => sum + bill.amount, 0);
      const avgProcessingTime = 5; // minutes per bill
      const timeSaved = billsData.length * avgProcessingTime;
      
      // Calculate monthly trend
      const now = new Date();
      const prevMonthBills = billsData.filter(bill => {
        const billDate = new Date(bill.billDate);
        return billDate.getMonth() === now.getMonth() - 1 && 
               billDate.getFullYear() === now.getFullYear();
      });
      
      const currentMonthBills = billsData.filter(bill => {
        const billDate = new Date(bill.billDate);
        return billDate.getMonth() === now.getMonth() && 
               billDate.getFullYear() === now.getFullYear();
      });
      
      const monthlyTrend = prevMonthBills.length > 0 
        ? ((currentMonthBills.length - prevMonthBills.length) / prevMonthBills.length) * 100
        : 0;

      setStats({
        totalBills: paginationData.total,
        totalSpent,
        timeSaved,
        monthlyTrend
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, toast]);

  const updateBillStatus = async (billId: string, status: Bill['status']) => {
    try {
      await billsApi.updateBill(billId, { status });
      setBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, status } : bill
      ));
      toast({
        title: "Success",
        description: "Bill status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      await billsApi.deleteBill(billId);
      setBills(prev => prev.filter(bill => bill.id !== billId));
      setStats(prev => ({
        ...prev,
        totalBills: prev.totalBills - 1
      }));
      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: BillsQuery['sortBy']) => {
    setQuery(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (type: string, value: string) => {
    setQuery(prev => ({
      ...prev,
      [type]: value,
      page: 1 // Reset pagination when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery(prev => ({
      ...prev,
      page: newPage
    }));
  };

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return {
    bills,
    stats,
    query,
    pagination,
    isLoading,
    updateBillStatus,
    deleteBill,
    handleSort,
    handleFilter,
    handlePageChange,
  };
};