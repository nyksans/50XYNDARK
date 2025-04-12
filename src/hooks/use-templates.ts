import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bill, billsApi } from '@/lib/api-client';

export interface BillTemplate extends Omit<Bill, 'id' | 'billDate' | 'createdAt' | 'updatedAt'> {
  name: string;
  description?: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customFrequency?: number; // in days
  reminderDays?: number; // days before due date to remind
}

const useTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      const storedTemplates = localStorage.getItem('billTemplates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: BillTemplate) => {
    try {
      const updatedTemplates = [...templates, template];
      setTemplates(updatedTemplates);
      localStorage.setItem('billTemplates', JSON.stringify(updatedTemplates));
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateTemplate = async (index: number, template: BillTemplate) => {
    try {
      const updatedTemplates = [...templates];
      updatedTemplates[index] = template;
      setTemplates(updatedTemplates);
      localStorage.setItem('billTemplates', JSON.stringify(updatedTemplates));
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTemplate = async (index: number) => {
    try {
      const updatedTemplates = templates.filter((_, i) => i !== index);
      setTemplates(updatedTemplates);
      localStorage.setItem('billTemplates', JSON.stringify(updatedTemplates));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
      return false;
    }
  };

  const createBillFromTemplate = async (template: BillTemplate) => {
    try {
      // Create a new bill from the template
      const newBill: Partial<Bill> = {
        billType: template.billType,
        companyName: template.companyName,
        amount: template.amount,
        accountNumber: template.accountNumber,
        usageSummary: template.usageSummary,
        status: 'pending',
        // Set the due date based on template frequency
        dueDate: calculateNextDueDate(template),
      };

      const response = await billsApi.processBill(new File([], 'template'));
      toast({
        title: 'Success',
        description: 'Bill created from template',
      });
      return response;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create bill from template',
        variant: 'destructive',
      });
      return null;
    }
  };

  const calculateNextDueDate = (template: BillTemplate): string => {
    const today = new Date();
    let nextDueDate = new Date(today);

    switch (template.frequency) {
      case 'monthly':
        nextDueDate.setMonth(today.getMonth() + 1);
        break;
      case 'quarterly':
        nextDueDate.setMonth(today.getMonth() + 3);
        break;
      case 'yearly':
        nextDueDate.setFullYear(today.getFullYear() + 1);
        break;
      case 'custom':
        if (template.customFrequency) {
          nextDueDate.setDate(today.getDate() + template.customFrequency);
        }
        break;
    }

    return nextDueDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    isLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    createBillFromTemplate,
  };
};

export default useTemplates;