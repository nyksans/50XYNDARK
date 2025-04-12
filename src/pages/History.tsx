
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Download, Eye, FileText, Filter, PieChart, Search, Trash2 } from "lucide-react";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBillType, setSelectedBillType] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  
  // Bill history data - would come from API in real implementation
  const bills = [
    { id: 1, name: "Electric Bill", provider: "Energy Provider Inc.", amount: 124.50, date: "2025-04-01", status: "Paid", type: "utility" },
    { id: 2, name: "Water Bill", provider: "City Water Dept", amount: 67.25, date: "2025-04-01", status: "Pending", type: "utility" },
    { id: 3, name: "Gas Bill", provider: "National Gas Co", amount: 98.72, date: "2025-03-28", status: "Paid", type: "utility" },
    { id: 4, name: "Internet Bill", provider: "Fast Internet Inc", amount: 89.99, date: "2025-03-15", status: "Paid", type: "utility" },
    { id: 5, name: "Phone Bill", provider: "Mobile Carrier", amount: 54.30, date: "2025-03-10", status: "Paid", type: "utility" },
    { id: 6, name: "Rent", provider: "Property Management LLC", amount: 1200.00, date: "2025-03-01", status: "Paid", type: "housing" },
    { id: 7, name: "Car Insurance", provider: "Safe Insurance Co", amount: 123.45, date: "2025-02-25", status: "Paid", type: "insurance" },
    { id: 8, name: "Streaming Service", provider: "StreamFlix", amount: 14.99, date: "2025-02-18", status: "Paid", type: "subscription" },
    { id: 9, name: "Gym Membership", provider: "FitLife Gym", amount: 49.99, date: "2025-02-15", status: "Paid", type: "subscription" },
    { id: 10, name: "Credit Card", provider: "National Bank", amount: 320.55, date: "2025-02-10", status: "Paid", type: "credit" },
  ];
  
  // Filter bills based on search query, bill type, and date range
  const filteredBills = bills.filter(bill => {
    // Search filter
    const matchesSearch = 
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.provider.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Bill type filter
    const matchesType = selectedBillType === "all" || bill.type === selectedBillType;
    
    // Date range filter - simplified for this example
    let matchesDate = true;
    const billDate = new Date(bill.date);
    const now = new Date();
    
    if (selectedDateRange === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      matchesDate = billDate >= oneMonthAgo;
    } else if (selectedDateRange === "quarter") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      matchesDate = billDate >= threeMonthsAgo;
    } else if (selectedDateRange === "year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      matchesDate = billDate >= oneYearAgo;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });
  
  // Calculate total amounts
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold">Bill History</h1>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button className="bg-muted hover:bg-muted/80 text-foreground font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </button>
              <button className="bg-muted hover:bg-muted/80 text-foreground font-medium px-4 py-2 rounded-md transition-colors inline-flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Analytics
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3 glass-card p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search bills..."
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-2 rounded-md border border-input bg-background"
                    value={selectedBillType}
                    onChange={(e) => setSelectedBillType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="utility">Utilities</option>
                    <option value="housing">Housing</option>
                    <option value="insurance">Insurance</option>
                    <option value="subscription">Subscriptions</option>
                    <option value="credit">Credit</option>
                  </select>
                  <select 
                    className="px-3 py-2 rounded-md border border-input bg-background"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                  <button className="p-2 rounded-md border border-input bg-background text-foreground hover:bg-muted transition-colors">
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-left font-medium">Bill</th>
                      <th className="py-3 px-4 text-left font-medium">Provider</th>
                      <th className="py-3 px-4 text-left font-medium">Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border">
                        <td className="py-3 px-4 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {bill.name}
                        </td>
                        <td className="py-3 px-4">{bill.provider}</td>
                        <td className="py-3 px-4">${bill.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{bill.date}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            bill.status === 'Paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredBills.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bills found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Bills</p>
                  <p className="text-2xl font-bold">{filteredBills.length}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Bill Distribution</p>
                  <div className="h-48 flex items-end space-x-2">
                    {['utility', 'housing', 'insurance', 'subscription', 'credit'].map((type) => {
                      const count = filteredBills.filter(bill => bill.type === type).length;
                      const percentage = filteredBills.length ? (count / filteredBills.length) * 100 : 0;
                      
                      return (
                        <div key={type} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-sm" 
                            style={{ height: `${percentage}%` }}
                          ></div>
                          <span className="text-xs mt-2 text-muted-foreground capitalize">
                            {type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-md transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default History;
