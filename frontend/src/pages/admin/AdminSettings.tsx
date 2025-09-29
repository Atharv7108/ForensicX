import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Database, 
  Shield, 
  Zap, 
  Bell, 
  Mail,
  Lock,
  Eye,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="min-h-screen">
      {/* Settings Header */}
      <div className="glass-panel gradient-admin-header border-b border-border/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Admin Settings
              </h1>
              <p className="text-muted-foreground text-sm">Configure system preferences and security</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="glass status-online">
                System Online
              </Badge>
              <Button variant="outline" className="glass hover-glow">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto space-y-8">
        {/* System Configuration */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Database Auto-Backup</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Enable automatic daily backups</span>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Model Caching</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Cache ML models for faster responses</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Debug Logging</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Enable detailed system logs</span>
                  <Switch />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Analytics Collection</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Collect usage analytics</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-warning" />
              Security & Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Two-Factor Authentication</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Require 2FA for admin access</span>
                  <Switch />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Session Timeout</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Auto-logout after inactivity</span>
                  <Badge variant="secondary" className="glass">30 minutes</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">API Rate Limiting</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Limit requests per minute</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Failed Login Protection</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Block after failed attempts</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Notifications & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Email Notifications</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">System alerts via email</span>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">User Registration Alerts</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Notify on new user signups</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">High Usage Warnings</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Alert on high API usage</span>
                  <Switch />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">System Health Checks</label>
                <div className="flex items-center justify-between glass rounded-lg p-3">
                  <span className="text-sm text-muted-foreground">Daily system status reports</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-success" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="glass hover-glow justify-start gap-2 h-16">
                <Download className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Export Data</div>
                  <div className="text-xs text-muted-foreground">Download system data</div>
                </div>
              </Button>

              <Button variant="outline" className="glass hover-glow justify-start gap-2 h-16">
                <Upload className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <div className="font-medium">Import Data</div>
                  <div className="text-xs text-muted-foreground">Upload backup files</div>
                </div>
              </Button>

              <Button variant="outline" className="glass hover-glow justify-start gap-2 h-16">
                <RefreshCw className="w-5 h-5 text-warning" />
                <div className="text-left">
                  <div className="font-medium">Cleanup Logs</div>
                  <div className="text-xs text-muted-foreground">Remove old log files</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Monitoring */}
        <Card className="metric-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Performance & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">98.5%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">120ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent">245MB</div>
                <div className="text-sm text-muted-foreground">Memory Usage</div>
              </div>
              
              <div className="glass rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning">15</div>
                <div className="text-sm text-muted-foreground">Active Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="glass">
            Cancel Changes
          </Button>
          <Button className="gradient-primary hover-glow">
            <Settings className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}