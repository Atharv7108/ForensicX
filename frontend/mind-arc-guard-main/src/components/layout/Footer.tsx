import { Link } from "react-router-dom";
import { Shield, Mail, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card/30 border-t border-border/50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">forensicX</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Advanced AI detection technology to protect content authenticity and combat artificial intelligence misuse.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="/api" className="hover:text-primary transition-colors">API</a></li>
              <li><a href="/integrations" className="hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-primary transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                About Us
              </a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/docs" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="/status" className="hover:text-primary transition-colors">System Status</a></li>
              <li><a href="/feedback" className="hover:text-primary transition-colors">Feedback</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 forensicX. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms
            </a>
            <a href="/cookies" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
