import { Link } from "react-router-dom";
import { 
  BarChart3, Calendar, Clock, DollarSign, 
  FileText, Plus, Receipt, TrendingUp 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatsCard from "@/components/StatsCard";
import { useBills } from "@/hooks/use-bills";
import { type Bill } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Dashboard = () => {
  const {
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
  } = useBills();

  const renderPaginationItems = () => {
    const items = [];
    const maxPages = Math.min(5, pagination.totalPages);
    const currentPage = pagination.page;
    
    // Calculate start and end pages
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // Add first page if not included in range
    if (startPage > 1) {
      items.push(
        <PaginationButton
          key={1}
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationButton>
      );
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }

    // Add pages in range
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationButton
          key={page}
          onClick={() => handlePageChange(page)}
          isActive={currentPage === page}
        >
          {page}
        </PaginationButton>
      );
    }

    // Add last page if not included in range
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      items.push(
        <PaginationButton
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          isActive={currentPage === pagination.totalPages}
        >
          {pagination.totalPages}
        </PaginationButton>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="mt-4 md:mt-0">
              <Link to="/scan">
                <Button className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Scan New Bill
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Bills"
              value={stats.totalBills.toString()}
              icon={FileText}
              trend={{ value: Math.round(stats.monthlyTrend), isPositive: stats.monthlyTrend > 0 }}
            />
            <StatsCard
              title="Total Spent"
              value={stats.totalSpent.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })}
              icon={DollarSign}
              trend={{ value: 8, isPositive: false }}
            />
            <StatsCard
              title="Time Saved"
              value={`${Math.round(stats.timeSaved)} mins`}
              icon={Clock}
              trend={{ value: 15, isPositive: true }}
            />
            <StatsCard
              title="Monthly Trend"
              value={`${Math.round(stats.monthlyTrend)}%`}
              icon={TrendingUp}
              trend={{ value: stats.monthlyTrend, isPositive: stats.monthlyTrend > 0 }}
            />
          </div>
          
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Bills</h2>
              <div className="flex gap-4">
                <Select
                  value={query.type}
                  onValueChange={(value) => handleFilter('type', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={query.dateRange}
                  onValueChange={(value) => handleFilter('dateRange', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Search bills..."
                  className="w-[200px]"
                  value={query.query || ''}
                  onChange={(e) => handleFilter('query', e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Company Name
                    </TableHead>
                    <TableHead>Bill Type</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      Due Date
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        {Array(6).fill(0).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : bills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No bills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          {bill.companyName}
                        </TableCell>
                        <TableCell className="capitalize">
                          {bill.billType}
                        </TableCell>
                        <TableCell>
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {bill.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={bill.status}
                            onValueChange={(value) => updateBillStatus(bill.id, value as Bill['status'])}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="processed">Processed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* View handler */}}
                            >
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this bill?')) {
                                  deleteBill(bill.id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {!isLoading && bills.length > 0 && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    />
                    {renderPaginationItems()}
                    <PaginationNext 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    />
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
