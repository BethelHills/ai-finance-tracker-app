import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll allow access without authentication
    // In production, you would want to add proper authentication here

    // Enhanced audit log data with more realistic events
    const events = [
      {
        id: 'audit_1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        userId: 'user_123',
        action: 'login_success',
        resource: 'authentication',
        resourceId: 'session_456',
        details: { ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0...' },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_456',
        severity: 'low',
        category: 'authentication',
        hash: 'a1b2c3d4e5f6...',
        signature: 'sig_1234567890...',
      },
      {
        id: 'audit_2',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        userId: 'user_123',
        action: 'transaction_created',
        resource: 'transaction',
        resourceId: 'tx_789',
        details: { amount: 150.0, type: 'expense', category: 'groceries' },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_456',
        severity: 'medium',
        category: 'data_modification',
        hash: 'b2c3d4e5f6a1...',
        signature: 'sig_2345678901...',
      },
      {
        id: 'audit_3',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        userId: 'user_123',
        action: 'bank_account_linked',
        resource: 'account',
        resourceId: 'acc_101',
        details: { provider: 'plaid', institution: 'Chase Bank' },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_456',
        severity: 'high',
        category: 'data_modification',
        hash: 'c3d4e5f6a1b2...',
        signature: 'sig_3456789012...',
      },
      {
        id: 'audit_4',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        userId: 'user_456',
        action: 'failed_login_attempt',
        resource: 'authentication',
        resourceId: 'session_789',
        details: { ipAddress: '192.168.1.200', reason: 'invalid_password' },
        ipAddress: '192.168.1.200',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'session_789',
        severity: 'medium',
        category: 'authentication',
        hash: 'd4e5f6a1b2c3...',
        signature: 'sig_4567890123...',
      },
      {
        id: 'audit_5',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        userId: 'user_123',
        action: 'payment_processed',
        resource: 'payment',
        resourceId: 'pay_202',
        details: { amount: 75.5, currency: 'USD', provider: 'stripe' },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_456',
        severity: 'high',
        category: 'payment',
        hash: 'e5f6a1b2c3d4...',
        signature: 'sig_5678901234...',
      },
      {
        id: 'audit_6',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        userId: 'user_789',
        action: 'admin_access',
        resource: 'admin_panel',
        resourceId: 'admin_001',
        details: { action: 'viewed_audit_logs', permissions: ['admin:read'] },
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        sessionId: 'session_999',
        severity: 'low',
        category: 'authorization',
        hash: 'f6a1b2c3d4e5...',
        signature: 'sig_6789012345...',
      },
      {
        id: 'audit_7',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        userId: 'user_123',
        action: 'data_export',
        resource: 'transactions',
        resourceId: 'export_001',
        details: {
          format: 'csv',
          recordCount: 150,
          dateRange: '2024-01-01 to 2024-01-31',
        },
        ipAddress: '192.168.1.100',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'session_456',
        severity: 'medium',
        category: 'data_access',
        hash: 'g7b2c3d4e5f6...',
        signature: 'sig_7890123456...',
      },
      {
        id: 'audit_8',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        userId: 'user_456',
        action: 'security_alert',
        resource: 'system',
        resourceId: 'alert_001',
        details: {
          alertType: 'suspicious_activity',
          location: 'admin_panel',
          riskLevel: 'high',
        },
        ipAddress: '192.168.1.200',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        sessionId: 'session_789',
        severity: 'critical',
        category: 'system',
        hash: 'h8c3d4e5f6a1...',
        signature: 'sig_8901234567...',
      },
    ];

    const stats = {
      totalEvents: events.length,
      eventsByCategory: {
        authentication: events.filter(e => e.category === 'authentication')
          .length,
        authorization: events.filter(e => e.category === 'authorization')
          .length,
        data_access: events.filter(e => e.category === 'data_access').length,
        data_modification: events.filter(
          e => e.category === 'data_modification'
        ).length,
        payment: events.filter(e => e.category === 'payment').length,
        compliance: events.filter(e => e.category === 'compliance').length,
        system: events.filter(e => e.category === 'system').length,
      },
      eventsBySeverity: {
        low: events.filter(e => e.severity === 'low').length,
        medium: events.filter(e => e.severity === 'medium').length,
        high: events.filter(e => e.severity === 'high').length,
        critical: events.filter(e => e.severity === 'critical').length,
      },
      eventsByUser: {
        user_123: events.filter(e => e.userId === 'user_123').length,
        user_456: events.filter(e => e.userId === 'user_456').length,
        user_789: events.filter(e => e.userId === 'user_789').length,
      },
      recentActivity: events.filter(
        e => new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    };

    return NextResponse.json({ events, stats });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to load audit logs' },
      { status: 500 }
    );
  }
}
