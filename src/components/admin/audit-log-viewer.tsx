'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Shield,
  User,
  Database,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'data_modification'
    | 'payment'
    | 'compliance'
    | 'system';
  hash: string;
  signature: string;
}

interface AuditStats {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByUser: Record<string, number>;
  recentActivity: number;
}

export function AuditLogViewer() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    totalEvents: 0,
    eventsByCategory: {},
    eventsBySeverity: {},
    eventsByUser: {},
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const { toast } = useToast();

  const loadAuditEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/audit-logs');
      if (response.ok) {
        const data = await response.json();
        setAuditEvents(data.events);
        setStats(data.stats);
      } else {
        // If API fails, use mock data
        const mockEvents = [
          {
            id: 'audit_1',
            timestamp: new Date('2024-01-20T10:30:00Z'),
            userId: 'user_123',
            action: 'login_success',
            resource: 'authentication',
            resourceId: 'session_456',
            details: {
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0...',
            },
            ipAddress: '192.168.1.100',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'session_456',
            severity: 'low' as const,
            category: 'authentication' as const,
            hash: 'a1b2c3d4e5f6...',
            signature: 'sig_1234567890...',
          },
          {
            id: 'audit_2',
            timestamp: new Date('2024-01-20T10:35:00Z'),
            userId: 'user_123',
            action: 'transaction_created',
            resource: 'transaction',
            resourceId: 'tx_789',
            details: { amount: 150.0, type: 'expense', category: 'groceries' },
            ipAddress: '192.168.1.100',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'session_456',
            severity: 'medium' as const,
            category: 'data_modification' as const,
            hash: 'b2c3d4e5f6a1...',
            signature: 'sig_2345678901...',
          },
          {
            id: 'audit_3',
            timestamp: new Date('2024-01-20T10:40:00Z'),
            userId: 'user_123',
            action: 'bank_account_linked',
            resource: 'account',
            resourceId: 'acc_101',
            details: { provider: 'plaid', institution: 'Chase Bank' },
            ipAddress: '192.168.1.100',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'session_456',
            severity: 'high' as const,
            category: 'data_modification' as const,
            hash: 'c3d4e5f6a1b2...',
            signature: 'sig_3456789012...',
          },
          {
            id: 'audit_4',
            timestamp: new Date('2024-01-20T10:45:00Z'),
            userId: 'user_456',
            action: 'failed_login_attempt',
            resource: 'authentication',
            resourceId: 'session_789',
            details: { ipAddress: '192.168.1.200', reason: 'invalid_password' },
            ipAddress: '192.168.1.200',
            userAgent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            sessionId: 'session_789',
            severity: 'medium' as const,
            category: 'authentication' as const,
            hash: 'd4e5f6a1b2c3...',
            signature: 'sig_4567890123...',
          },
          {
            id: 'audit_5',
            timestamp: new Date('2024-01-20T10:50:00Z'),
            userId: 'user_123',
            action: 'payment_processed',
            resource: 'payment',
            resourceId: 'pay_202',
            details: { amount: 75.5, currency: 'USD', provider: 'stripe' },
            ipAddress: '192.168.1.100',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'session_456',
            severity: 'high' as const,
            category: 'payment' as const,
            hash: 'e5f6a1b2c3d4...',
            signature: 'sig_5678901234...',
          },
        ];

        const mockStats = {
          totalEvents: mockEvents.length,
          eventsByCategory: {
            authentication: mockEvents.filter(
              e => e.category === 'authentication'
            ).length,
            authorization: 0, // No authorization events in mock data
            data_access: 0, // No data_access events in mock data
            data_modification: mockEvents.filter(
              e => e.category === 'data_modification'
            ).length,
            payment: mockEvents.filter(e => e.category === 'payment').length,
            compliance: 0, // No compliance events in mock data
            system: 0, // No system events in mock data
          },
          eventsBySeverity: {
            low: mockEvents.filter(e => e.severity === 'low').length,
            medium: mockEvents.filter(e => e.severity === 'medium').length,
            high: mockEvents.filter(e => e.severity === 'high').length,
            critical: 0, // No critical events in mock data
          },
          eventsByUser: {
            user_123: mockEvents.filter(e => e.userId === 'user_123').length,
            user_456: mockEvents.filter(e => e.userId === 'user_456').length,
          },
          recentActivity: mockEvents.filter(
            e =>
              new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length,
        };

        setAuditEvents(mockEvents);
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterAndSortEvents = useCallback(() => {
    let filtered = [...auditEvents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        event =>
          event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(event => event.severity === severityFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(event => event.userId === userFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'action':
          aValue = a.action.toLowerCase();
          bValue = b.action.toLowerCase();
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity as keyof typeof severityOrder];
          bValue = severityOrder[b.severity as keyof typeof severityOrder];
          break;
        case 'userId':
          aValue = a.userId.toLowerCase();
          bValue = b.userId.toLowerCase();
          break;
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(filtered);
  }, [
    auditEvents,
    searchTerm,
    categoryFilter,
    severityFilter,
    userFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadAuditEvents();
  }, [loadAuditEvents]);

  useEffect(() => {
    filterAndSortEvents();
  }, [filterAndSortEvents]);

  const exportAuditLogs = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(
        `/api/admin/audit-logs/export?format=${format}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: filteredEvents,
            filters: { categoryFilter, severityFilter, userFilter, searchTerm },
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Audit logs exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      case 'high':
        return <AlertTriangle className='h-4 w-4 text-orange-600' />;
      case 'medium':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'low':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'default',
    } as const;

    return (
      <Badge
        variant={variants[severity as keyof typeof variants] || 'secondary'}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <User className='h-4 w-4' />;
      case 'authorization':
        return <Shield className='h-4 w-4' />;
      case 'data_access':
        return <Database className='h-4 w-4' />;
      case 'data_modification':
        return <Database className='h-4 w-4' />;
      case 'payment':
        return <CreditCard className='h-4 w-4' />;
      case 'compliance':
        return <Shield className='h-4 w-4' />;
      case 'system':
        return <Database className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Audit Log Viewer</h2>
          <p className='text-muted-foreground'>
            Monitor and review all system activities and user actions
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={() => exportAuditLogs('csv')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
          <Button onClick={() => exportAuditLogs('json')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export JSON
          </Button>
          <Button onClick={loadAuditEvents}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalEvents}</div>
            <p className='text-xs text-muted-foreground'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Critical Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {stats.eventsBySeverity.critical || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.eventsBySeverity.high || 0}
            </div>
            <p className='text-xs text-muted-foreground'>Security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.recentActivity}
            </div>
            <p className='text-xs text-muted-foreground'>Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search events...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='authentication'>Authentication</SelectItem>
                <SelectItem value='authorization'>Authorization</SelectItem>
                <SelectItem value='data_access'>Data Access</SelectItem>
                <SelectItem value='data_modification'>
                  Data Modification
                </SelectItem>
                <SelectItem value='payment'>Payment</SelectItem>
                <SelectItem value='compliance'>Compliance</SelectItem>
                <SelectItem value='system'>System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Severity' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Severity</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder='User' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Users</SelectItem>
                {Object.keys(stats.eventsByUser).map(userId => (
                  <SelectItem key={userId} value={userId}>
                    {userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex space-x-2'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='timestamp'>Timestamp</SelectItem>
                  <SelectItem value='action'>Action</SelectItem>
                  <SelectItem value='severity'>Severity</SelectItem>
                  <SelectItem value='userId'>User</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='icon'
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
              >
                <ArrowUpDown className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer'
                onClick={() => setSelectedEvent(event)}
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-2'>
                    {getSeverityIcon(event.severity)}
                    {getCategoryIcon(event.category)}
                  </div>

                  <div>
                    <p className='font-medium'>{event.action}</p>
                    <p className='text-sm text-muted-foreground'>
                      {event.resource} • {event.resourceId}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(event.timestamp).toLocaleString()} •{' '}
                      {event.userId}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='text-right'>
                    <div className='flex items-center space-x-2'>
                      {getSeverityBadge(event.severity)}
                      <Badge variant='outline'>{event.category}</Badge>
                    </div>
                    {event.ipAddress && (
                      <p className='text-xs text-muted-foreground mt-1'>
                        {event.ipAddress}
                      </p>
                    )}
                  </div>

                  <Button size='sm' variant='outline'>
                    <Eye className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-muted-foreground'>No audit events found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <Card className='max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSelectedEvent(null)}
                className='absolute top-4 right-4'
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Event ID</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.id}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Timestamp</label>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>User ID</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.userId}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Action</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.action}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Resource</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.resource}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Resource ID</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.resourceId}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Severity</label>
                  <div className='flex items-center space-x-2'>
                    {getSeverityIcon(selectedEvent.severity)}
                    {getSeverityBadge(selectedEvent.severity)}
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>Category</label>
                  <div className='flex items-center space-x-2'>
                    {getCategoryIcon(selectedEvent.category)}
                    <Badge variant='outline'>{selectedEvent.category}</Badge>
                  </div>
                </div>
              </div>

              {selectedEvent.ipAddress && (
                <div>
                  <label className='text-sm font-medium'>IP Address</label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedEvent.ipAddress}
                  </p>
                </div>
              )}

              {selectedEvent.userAgent && (
                <div>
                  <label className='text-sm font-medium'>User Agent</label>
                  <p className='text-sm text-muted-foreground break-all'>
                    {selectedEvent.userAgent}
                  </p>
                </div>
              )}

              <div>
                <label className='text-sm font-medium'>Details</label>
                <pre className='text-sm text-muted-foreground bg-gray-100 p-3 rounded mt-1 overflow-x-auto'>
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>

              <div>
                <label className='text-sm font-medium'>Hash</label>
                <p className='text-sm text-muted-foreground font-mono break-all'>
                  {selectedEvent.hash}
                </p>
              </div>

              <div>
                <label className='text-sm font-medium'>Signature</label>
                <p className='text-sm text-muted-foreground font-mono break-all'>
                  {selectedEvent.signature}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
