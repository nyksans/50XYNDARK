
import { Github, Mail, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-heading font-bold gradient-text">Gebill</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              Smart bill processing powered by AI. Save time, reduce errors, and gain insights into your expenses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground/70 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-primary">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
              <li><Link to="/scan" className="text-muted-foreground hover:text-primary">Scan Bill</Link></li>
              <li><Link to="/templates" className="text-muted-foreground hover:text-primary">Templates</Link></li>
              <li><Link to="/history" className="text-muted-foreground hover:text-primary">History</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-primary">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
              <li><Link to="/compliance" className="text-muted-foreground hover:text-primary">Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Gebill. All rights reserved. Developed by XYNDARK.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
