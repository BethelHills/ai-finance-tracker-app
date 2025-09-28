import { NextRequest, NextResponse } from 'next/server';
import { AccessControlService } from '@/lib/security/access-control';
import { WebhookSecurityService } from '@/lib/security/webhook-security';
import { AuditTrailService } from '@/lib/security/audit-trail';
import { SecurityConfigService } from '@/lib/security/security-config';

/**
 * Security Middleware
 * Implements comprehensive security checks for all API routes
 */

export interface SecurityContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  requestId: string;
  timestamp: Date;
}

export class SecurityMiddleware {
  /**
   * Main security middleware
   */
  static async secureRequest(
    request: NextRequest,
    handler: (
      request: NextRequest,
      context: SecurityContext
    ) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // Extract security context
      const context = await this.extractSecurityContext(request);

      // Perform security checks
      const securityCheck = await this.performSecurityChecks(request, context);
      if (!securityCheck.allowed) {
        return this.createSecurityErrorResponse(securityCheck.reason, 403);
      }

      // Log request
      await this.logRequest(request, context);

      // Execute handler
      const response = await handler(request, context);

      // Log response
      await this.logResponse(request, response, context);

      return response;
    } catch (error) {
      console.error('[SECURITY] Middleware error:', error);
      return this.createSecurityErrorResponse('Internal security error', 500);
    }
  }

  /**
   * Webhook security middleware
   */
  static async secureWebhook(
    request: NextRequest,
    provider: 'stripe' | 'paystack' | 'flutterwave' | 'plaid',
    handler: (request: NextRequest, payload: any) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const body = await request.text();
      const signature =
        request.headers.get('x-signature') ||
        request.headers.get('stripe-signature') ||
        request.headers.get('x-paystack-signature') ||
        request.headers.get('verif-hash') ||
        '';

      // Verify webhook signature
      const isValidSignature = await WebhookSecurityService.verifySignature(
        body,
        signature,
        provider
      );

      if (!isValidSignature) {
        await this.logSecurityEvent('webhook_signature_verification_failed', {
          provider,
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || '',
        });
        return this.createSecurityErrorResponse(
          'Invalid webhook signature',
          401
        );
      }

      // Process webhook
      const payload = JSON.parse(body);
      const result = await WebhookSecurityService.processWebhook(
        provider,
        payload.type || payload.event,
        payload,
        signature
      );

      if (!result.success) {
        return this.createSecurityErrorResponse(
          'Webhook processing failed',
          400
        );
      }

      // Execute handler
      const response = await handler(request, payload);

      return response;
    } catch (error) {
      console.error('[SECURITY] Webhook middleware error:', error);
      return this.createSecurityErrorResponse('Webhook security error', 500);
    }
  }

  /**
   * Access control middleware
   */
  static async checkAccess(
    request: NextRequest,
    resource: string,
    action: string,
    context: SecurityContext
  ): Promise<NextResponse | null> {
    try {
      const accessDecision = await AccessControlService.checkPermission(
        context.userId,
        resource,
        action,
        {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
        }
      );

      if (!accessDecision.allowed) {
        await this.logSecurityEvent('access_denied', {
          userId: context.userId,
          resource,
          action,
          reason: accessDecision.reason,
          ipAddress: context.ipAddress,
        });

        return this.createSecurityErrorResponse(
          `Access denied: ${accessDecision.reason}`,
          403
        );
      }

      // Log high-risk access
      if (accessDecision.riskLevel === 'high' || accessDecision.auditRequired) {
        await AuditTrailService.createAuditEvent(
          context.userId,
          'high_risk_access',
          resource,
          action,
          {
            riskLevel: accessDecision.riskLevel,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          },
          {
            severity: 'high',
            category: 'authorization',
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
            sessionId: context.sessionId,
          }
        );
      }

      return null; // Access allowed
    } catch (error) {
      console.error('[SECURITY] Access control error:', error);
      return this.createSecurityErrorResponse('Access control error', 500);
    }
  }

  /**
   * Rate limiting middleware
   */
  static async checkRateLimit(
    request: NextRequest,
    context: SecurityContext
  ): Promise<NextResponse | null> {
    try {
      const rateLimit = await WebhookSecurityService.checkRateLimit(
        'api',
        context.ipAddress
      );

      if (!rateLimit.allowed) {
        await this.logSecurityEvent('rate_limit_exceeded', {
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(
              (rateLimit.resetTime.getTime() - Date.now()) / 1000
            ),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(
                (rateLimit.resetTime.getTime() - Date.now()) / 1000
              ).toString(),
            },
          }
        );
      }

      return null; // Rate limit not exceeded
    } catch (error) {
      console.error('[SECURITY] Rate limiting error:', error);
      return null; // Allow request if rate limiting fails
    }
  }

  // Private helper methods

  private static async extractSecurityContext(
    request: NextRequest
  ): Promise<SecurityContext> {
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const sessionId = request.headers.get('x-session-id') || undefined;
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const requestId =
      request.headers.get('x-request-id') || this.generateRequestId();

    return {
      userId,
      ipAddress,
      userAgent,
      sessionId,
      requestId,
      timestamp: new Date(),
    };
  }

  private static async performSecurityChecks(
    request: NextRequest,
    context: SecurityContext
  ): Promise<{ allowed: boolean; reason: string }> {
    // Check for suspicious patterns
    if (this.isSuspiciousRequest(request, context)) {
      return {
        allowed: false,
        reason: 'Suspicious request pattern detected',
      };
    }

    // Check for malicious payloads
    if (await this.containsMaliciousContent(request)) {
      return {
        allowed: false,
        reason: 'Malicious content detected',
      };
    }

    // Check rate limiting
    const rateLimitCheck = await this.checkRateLimit(request, context);
    if (rateLimitCheck) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
      };
    }

    return { allowed: true, reason: 'Security checks passed' };
  }

  private static isSuspiciousRequest(
    request: NextRequest,
    context: SecurityContext
  ): boolean {
    const url = request.url;
    const userAgent = context.userAgent;

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+set/i,
      /or\s+1=1/i,
    ];

    if (sqlPatterns.some(pattern => pattern.test(url))) {
      return true;
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
    ];

    if (xssPatterns.some(pattern => pattern.test(url))) {
      return true;
    }

    // Check for suspicious user agents
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /hack/i,
      /exploit/i,
    ];

    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      return true;
    }

    return false;
  }

  private static async containsMaliciousContent(
    request: NextRequest
  ): Promise<boolean> {
    try {
      const body = await request.text();

      // Check for common attack patterns
      const maliciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /union\s+select/gi,
        /drop\s+table/gi,
        /insert\s+into/gi,
        /delete\s+from/gi,
        /update\s+set/gi,
        /or\s+1=1/gi,
      ];

      return maliciousPatterns.some(pattern => pattern.test(body));
    } catch (error) {
      return false; // Allow request if body parsing fails
    }
  }

  private static async logRequest(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    await AuditTrailService.createAuditEvent(
      context.userId,
      'api_request',
      'http',
      request.method,
      {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      {
        severity: 'low',
        category: 'data_access',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
      }
    );
  }

  private static async logResponse(
    request: NextRequest,
    response: NextResponse,
    context: SecurityContext
  ): Promise<void> {
    await AuditTrailService.createAuditEvent(
      context.userId,
      'api_response',
      'http',
      request.method,
      {
        status: response.status,
        url: request.url,
        method: request.method,
        responseTime: Date.now() - context.timestamp.getTime(),
      },
      {
        severity: 'low',
        category: 'data_access',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
      }
    );
  }

  private static async logSecurityEvent(
    event: string,
    details: Record<string, any>
  ): Promise<void> {
    await AuditTrailService.createAuditEvent(
      'system',
      event,
      'security',
      'middleware',
      details,
      {
        severity: 'high',
        category: 'compliance',
      }
    );
  }

  private static getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static createSecurityErrorResponse(
    message: string,
    status: number
  ): NextResponse {
    return NextResponse.json(
      {
        error: 'Security Error',
        message,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
