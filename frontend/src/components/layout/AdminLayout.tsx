import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  Database,
  Home,
  LogOut,
  Bell,
  Search,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: BarChart3,
    description: 'System metrics and analytics'
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management and activity'
  },
  {
    label: 'Analytics', 
    href: '/admin/analytics',
    icon: PieChart,
    description: 'Detection trends and insights'
  },
  {
    label: 'System',
    href: '/admin/system',
    icon: Database,
    description: 'Server health and performance'
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin configuration'
  }
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 glass-panel gradient-admin-sidebar border-r border-border/50 z-50">
        <div className="flex flex-col h-full">
          {/* Logo and Admin Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center neon-glow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ForensicX</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            
            <Badge variant="secondary" className="glass w-full justify-center">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    isActive 
                      ? 'nav-active' 
                      : 'nav-inactive hover-lift'
                  }`}
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs opacity-70">{item.description}</span>
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/50 space-y-2">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-4">
              <Button variant="ghost" size="sm" className="glass flex-1">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="glass flex-1">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="glass rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button 
              variant="outline" 
              className="w-full glass hover-glow justify-start gap-2"
              onClick={handleHomeClick}
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full glass hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
}