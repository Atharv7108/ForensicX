import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Activity, UserCheck, RefreshCw } from 'lucide-react';
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
        fetch('http://127.0.0.1:8001/admin/users/live', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://127.0.0.1:8001/admin/dashboard', {
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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
              <Shield className="h-8 w-8 text-blue-600" /> Admin Dashboard
            </h1>
            <p className="text-gray-600">Monitor users and system activity</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_users ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.active_users ?? 0} active, {stats.inactive_users ?? 0} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active_users ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.total_users && stats.active_users
                      ? `${((stats.active_users / stats.total_users) * 100).toFixed(1)}% of total`
                      : 'No users yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_detections ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {stats.plan_distribution
                      ? Object.entries(stats.plan_distribution).map(([plan, count]) => (
                          <div key={plan} className="flex justify-between">
                            <span className="capitalize">{plan}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))
                      : 'No plan data'}
                  </div>
                </CardContent>
              </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Total Detections</TableHead>
                    <TableHead>Monthly Detections</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.plan_type === 'pro' ? 'default' : 'secondary'}>
                            {user.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.total_detections}</TableCell>
                        <TableCell>{user.monthly_detections}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'destructive'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
