import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Activity, 
  UserCheck, 
  RefreshCw, 
  TrendingUp, 
  FileText, 
  Image, 
  FileX,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Database,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  total_detections: number;
  monthly_detections: number;
  plan_type: string;
  is_superuser: boolean;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  total_detections: number;
  plan_distribution: { [key: string]: number };
  detections: {
    total: number;
    by_type: { [key: string]: number };
  };
}

const ADMIN_EMAILS = ['admin@forensicx.com', 'atharvgole@gmail.com'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // Redirect non-admin users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchData = async () => {
    const token = localStorage.getItem('forensicx_token');
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/admin/users/live', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://127.0.0.1:8000/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersResponse.ok) {
        throw new Error(`Users API error: ${usersResponse.status}`);
      }
      if (!statsResponse.ok) {
        throw new Error(`Stats API error: ${statsResponse.status}`);
      }

      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      setUsers(usersData.users || []);
      setStats(statsData.stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin h-8 w-8 mr-2" />
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="glass border-b border-border/50 backdrop-blur-md sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground text-sm">Monitor system performance and user activity</p>
              </div>
              {lastUpdated && (
                <Badge variant="secondary" className="glass">
                  <Calendar className="w-3 h-3 mr-1" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh} 
                disabled={loading} 
                variant="outline"
                className="glass hover-glow"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button variant="ghost" className="glass">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 glass border-destructive/20">
            <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="glass gradient-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">{stats.total_users ?? 0}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center text-xs text-success">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stats.active_users ?? 0} active
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                        <div className="text-xs text-muted-foreground">
                          {stats.inactive_users ?? 0} inactive
                        </div>
                      </div>
                      <Progress 
                        value={stats.total_users ? (stats.active_users / stats.total_users) * 100 : 0} 
                        className="mt-3 h-2" 
                      />
                    </CardContent>
                  </Card>

                  <Card className="glass gradient-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                      <div className="p-2 rounded-lg bg-success/10">
                        <UserCheck className="h-4 w-4 text-success" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">{stats.active_users ?? 0}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.total_users && stats.active_users
                          ? `${((stats.active_users / stats.total_users) * 100).toFixed(1)}% engagement rate`
                          : 'No users yet'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass gradient-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Detections</CardTitle>
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Activity className="h-4 w-4 text-accent" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">{stats.total_detections ?? 0}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="w-3 h-3 mr-1" />
                          Text: {stats.detections?.by_type?.text ?? 0}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Image className="w-3 h-3 mr-1" />
                          Image: {stats.detections?.by_type?.image ?? 0}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <FileX className="w-3 h-3 mr-1" />
                          PDF: {stats.detections?.by_type?.pdf ?? 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Plan Distribution Chart */}
                <Card className="glass gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Plan Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stats.plan_distribution && Object.entries(stats.plan_distribution).map(([plan, count]) => (
                        <div key={plan} className="flex items-center justify-between p-4 rounded-lg glass">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              plan === 'pro' ? 'bg-primary' : 
                              plan === 'plus' ? 'bg-accent' : 'bg-muted-foreground'
                            }`}></div>
                            <span className="capitalize font-medium">{plan} Plan</span>
                          </div>
                          <Badge variant="secondary" className="glass">
                            {count} users
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="glass gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    User Management
                  </CardTitle>
                  <Badge variant="secondary" className="glass">
                    {users.length} total users
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/50 glass overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-muted/50">
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Plan</TableHead>
                        <TableHead className="text-muted-foreground">Detections</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Created</TableHead>
                        <TableHead className="text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id} className="border-border/50 hover:bg-muted/20">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">{user.username}</span>
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.plan_type === 'pro' ? 'default' : 'secondary'} 
                                className={`${
                                  user.plan_type === 'pro' ? 'bg-primary/20 text-primary border-primary/30' :
                                  user.plan_type === 'plus' ? 'bg-accent/20 text-accent border-accent/30' :
                                  'glass'
                                }`}
                              >
                                {user.plan_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.total_detections}</span>
                                <span className="text-sm text-muted-foreground">
                                  {user.monthly_detections} this month
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_active ? 'default' : 'destructive'} className="glass">
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="glass h-8 w-8 p-0">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-8 h-8 text-muted-foreground/50" />
                              <span>No users found</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Detection Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Analytics charts will be implemented here</p>
                      <p className="text-sm">Real-time detection metrics and trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Usage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Usage trend graphs coming soon</p>
                      <p className="text-sm">User activity and growth metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Connection</span>
                      <Badge variant="default" className="bg-success/20 text-success border-success/30">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tables</span>
                      <span className="font-medium">3 active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">2.4 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-warning" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">API Response</span>
                      <span className="font-medium text-success">~120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Model Load Time</span>
                      <span className="font-medium text-success">~800ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium">245 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
