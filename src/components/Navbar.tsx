
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-heading font-bold gradient-text">Gebill</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/scan" className="text-foreground/80 hover:text-primary transition-colors">
              Scan Bill
            </Link>
            <Link to="/templates" className="text-foreground/80 hover:text-primary transition-colors">
              Templates
            </Link>
            <Link to="/history" className="text-foreground/80 hover:text-primary transition-colors">
              History
            </Link>
            <Link to="/help" className="text-foreground/80 hover:text-primary transition-colors">
              Help
            </Link>
            <div className="pl-4 border-l border-border">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/scan" 
              className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Scan Bill
            </Link>
            <Link 
              to="/templates" 
              className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </Link>
            <Link 
              to="/history" 
              className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <Link 
              to="/help" 
              className="block px-3 py-2 rounded-md text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
