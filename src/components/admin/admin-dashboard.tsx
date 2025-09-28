'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Shield,
  Database,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { AuditLogViewer } from './audit-log-viewer';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastBackup: string;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivity: number;
  blockedIPs: number;
  securityScore: number;
}

export function AdminDashboard() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemHealth: 'healthy',
    uptime: '0d 0h 0m',
    lastBackup: 'Never',
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLogins: 0,
    suspiciousActivity: 0,
    blockedIPs: 0,
    securityScore: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      // Mock system data
      setSystemStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalTransactions: 15678,
        systemHealth: 'healthy',
        uptime: '15d 8h 32m',
        lastBackup: '2 hours ago',
      });

      setSecurityMetrics({
        failedLogins: 23,
        suspiciousActivity: 3,
        blockedIPs: 7,
        securityScore: 94,
      });
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'warning':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      case 'critical':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Admin Dashboard</h2>
          <p className='text-muted-foreground'>
            System administration and monitoring
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={loadSystemData} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {systemStats.totalUsers.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              {systemStats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {systemStats.totalTransactions.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-2'>
              {getHealthIcon(systemStats.systemHealth)}
              <span
                className={`text-lg font-bold ${getHealthColor(systemStats.systemHealth)}`}
              >
                {systemStats.systemHealth.charAt(0).toUpperCase() +
                  systemStats.systemHealth.slice(1)}
              </span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Uptime: {systemStats.uptime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {securityMetrics.securityScore}%
            </div>
            <p className='text-xs text-muted-foreground'>
              Overall security rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {securityMetrics.failedLogins}
            </div>
            <p className='text-xs text-muted-foreground'>Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {securityMetrics.suspiciousActivity}
            </div>
            <p className='text-xs text-muted-foreground'>Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Blocked IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {securityMetrics.blockedIPs}
            </div>
            <p className='text-xs text-muted-foreground'>Currently blocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue='audit' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='audit'>Audit Logs</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='system'>System</TabsTrigger>
        </TabsList>

        <TabsContent value='audit' className='space-y-4'>
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <Users className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>User Management</h3>
                <p className='text-muted-foreground mb-4'>
                  Manage user accounts, roles, and permissions
                </p>
                <Button>Manage Users</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Security Center</CardTitle>
              <CardDescription>
                Monitor security events and configure security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <Shield className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Security Center</h3>
                <p className='text-muted-foreground mb-4'>
                  Monitor security events and configure security settings
                </p>
                <Button>Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='system' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system settings and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12'>
                <Settings className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-lg font-semibold mb-2'>System Settings</h3>
                <p className='text-muted-foreground mb-4'>
                  Configure system settings and perform maintenance
                </p>
                <Button>System Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
