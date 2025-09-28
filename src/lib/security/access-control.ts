import { AuditTrailService } from './audit-trail';

/**
 * Least Privilege Access Control Service
 * Implements role-based access control with minimal permissions
 */

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: 'read' | 'write' | 'admin' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AccessRequest {
  userId: string;
  resource: string;
  action: string;
  context: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  requiredPermissions: string[];
  userPermissions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  auditRequired: boolean;
}

export class AccessControlService {
  private static roles: Map<string, Role> = new Map();
  private static userRoles: Map<string, UserRole[]> = new Map();

  /**
   * Initialize default roles and permissions
   */
  static initializeRoles(): void {
    // System Admin Role
    this.roles.set('system_admin', {
      id: 'system_admin',
      name: 'System Administrator',
      description: 'Full system access for administrative tasks',
      permissions: [{ resource: '*', action: '*' }],
      level: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Financial Admin Role
    this.roles.set('financial_admin', {
      id: 'financial_admin',
      name: 'Financial Administrator',
      description: 'Access to financial data and transactions',
      permissions: [
        { resource: 'transactions', action: 'read' },
        { resource: 'transactions', action: 'create' },
        { resource: 'transactions', action: 'update' },
        { resource: 'transactions', action: 'delete' },
        { resource: 'accounts', action: 'read' },
        { resource: 'accounts', action: 'create' },
        { resource: 'accounts', action: 'update' },
        { resource: 'reports', action: 'read' },
        { resource: 'reports', action: 'create' },
      ],
      level: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Compliance Officer Role
    this.roles.set('compliance_officer', {
      id: 'compliance_officer',
      name: 'Compliance Officer',
      description: 'Access to compliance and audit data',
      permissions: [
        { resource: 'audit_logs', action: 'read' },
        { resource: 'compliance_reports', action: 'read' },
        { resource: 'compliance_reports', action: 'create' },
        { resource: 'kyc_data', action: 'read' },
        { resource: 'aml_checks', action: 'read' },
        { resource: 'risk_assessments', action: 'read' },
      ],
      level: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Regular User Role
    this.roles.set('user', {
      id: 'user',
      name: 'Regular User',
      description: 'Standard user access to own data',
      permissions: [
        {
          resource: 'transactions',
          action: 'read',
          conditions: { userId: 'self' },
        },
        {
          resource: 'transactions',
          action: 'create',
          conditions: { userId: 'self' },
        },
        {
          resource: 'transactions',
          action: 'update',
          conditions: { userId: 'self' },
        },
        {
          resource: 'accounts',
          action: 'read',
          conditions: { userId: 'self' },
        },
        {
          resource: 'accounts',
          action: 'create',
          conditions: { userId: 'self' },
        },
        { resource: 'reports', action: 'read', conditions: { userId: 'self' } },
      ],
      level: 'read',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Read-Only User Role
    this.roles.set('readonly_user', {
      id: 'readonly_user',
      name: 'Read-Only User',
      description: 'Read-only access to own data',
      permissions: [
        {
          resource: 'transactions',
          action: 'read',
          conditions: { userId: 'self' },
        },
        {
          resource: 'accounts',
          action: 'read',
          conditions: { userId: 'self' },
        },
        { resource: 'reports', action: 'read', conditions: { userId: 'self' } },
      ],
      level: 'read',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Check if user has permission to perform action
   */
  static async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any> = {}
  ): Promise<AccessDecision> {
    const userRoles = this.getUserRoles(userId);
    const permissions = this.getUserPermissionsFromRoles(userId, userRoles);

    // Check for explicit permission
    const hasPermission = this.hasExplicitPermission(
      permissions,
      resource,
      action,
      context
    );

    if (hasPermission) {
      return {
        allowed: true,
        reason: 'User has explicit permission',
        requiredPermissions: [`${resource}:${action}`],
        userPermissions: permissions.map(p => `${p.resource}:${p.action}`),
        riskLevel: 'low',
        auditRequired: false,
      };
    }

    // Check for wildcard permissions
    const hasWildcardPermission = this.hasWildcardPermission(
      permissions,
      resource,
      action
    );

    if (hasWildcardPermission) {
      return {
        allowed: true,
        reason: 'User has wildcard permission',
        requiredPermissions: [`${resource}:${action}`],
        userPermissions: permissions.map(p => `${p.resource}:${p.action}`),
        riskLevel: 'medium',
        auditRequired: true,
      };
    }

    // Check for admin permissions
    const hasAdminPermission = this.hasAdminPermission(userRoles);

    if (hasAdminPermission) {
      return {
        allowed: true,
        reason: 'User has admin privileges',
        requiredPermissions: [`${resource}:${action}`],
        userPermissions: permissions.map(p => `${p.resource}:${p.action}`),
        riskLevel: 'high',
        auditRequired: true,
      };
    }

    // Log denied access
    await this.logAccessDenied(userId, resource, action, context);

    return {
      allowed: false,
      reason: 'Insufficient permissions',
      requiredPermissions: [`${resource}:${action}`],
      userPermissions: permissions.map(p => `${p.resource}:${p.action}`),
      riskLevel: 'low',
      auditRequired: false,
    };
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const userRole: UserRole = {
      userId,
      roleId,
      assignedAt: new Date(),
      assignedBy,
      expiresAt,
      isActive: true,
    };

    // Add to user roles
    const existingRoles = this.userRoles.get(userId) || [];
    existingRoles.push(userRole);
    this.userRoles.set(userId, existingRoles);

    // Log role assignment
    await AuditTrailService.createAuditEvent(
      assignedBy,
      'role_assigned',
      'user_role',
      userId,
      { roleId, assignedBy, expiresAt },
      { severity: 'medium', category: 'authorization' }
    );
  }

  /**
   * Remove role from user
   */
  static async removeRole(
    userId: string,
    roleId: string,
    removedBy: string
  ): Promise<void> {
    const userRoles = this.userRoles.get(userId) || [];
    const updatedRoles = userRoles.filter(ur => ur.roleId !== roleId);
    this.userRoles.set(userId, updatedRoles);

    // Log role removal
    await AuditTrailService.createAuditEvent(
      removedBy,
      'role_removed',
      'user_role',
      userId,
      { roleId, removedBy },
      { severity: 'medium', category: 'authorization' }
    );
  }

  /**
   * Get user's effective permissions
   */
  static getUserPermissions(userId: string): Permission[] {
    const userRoles = this.getUserRoles(userId);
    return this.getUserPermissionsFromRoles(userId, userRoles);
  }

  /**
   * Create custom role
   */
  static async createRole(
    roleId: string,
    name: string,
    description: string,
    permissions: Permission[],
    level: 'read' | 'write' | 'admin' | 'system',
    createdBy: string
  ): Promise<void> {
    const role: Role = {
      id: roleId,
      name,
      description,
      permissions,
      level,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(roleId, role);

    // Log role creation
    await AuditTrailService.createAuditEvent(
      createdBy,
      'role_created',
      'role',
      roleId,
      { name, description, permissions, level },
      { severity: 'high', category: 'authorization' }
    );
  }

  /**
   * Update role permissions
   */
  static async updateRole(
    roleId: string,
    permissions: Permission[],
    updatedBy: string
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    role.permissions = permissions;
    role.updatedAt = new Date();

    this.roles.set(roleId, role);

    // Log role update
    await AuditTrailService.createAuditEvent(
      updatedBy,
      'role_updated',
      'role',
      roleId,
      { permissions },
      { severity: 'high', category: 'authorization' }
    );
  }

  /**
   * Get access control report
   */
  static async getAccessControlReport(): Promise<{
    totalRoles: number;
    totalUsers: number;
    activeRoles: number;
    inactiveRoles: number;
    highPrivilegeUsers: number;
    recommendations: string[];
  }> {
    const totalRoles = this.roles.size;
    const totalUsers = this.userRoles.size;

    let activeRoles = 0;
    let inactiveRoles = 0;
    let highPrivilegeUsers = 0;

    for (const userRoles of this.userRoles.values()) {
      for (const userRole of userRoles) {
        if (userRole.isActive) {
          activeRoles++;

          const role = this.roles.get(userRole.roleId);
          if (role && (role.level === 'admin' || role.level === 'system')) {
            highPrivilegeUsers++;
          }
        } else {
          inactiveRoles++;
        }
      }
    }

    const recommendations = this.generateRecommendations();

    return {
      totalRoles,
      totalUsers,
      activeRoles,
      inactiveRoles,
      highPrivilegeUsers,
      recommendations,
    };
  }

  // Private helper methods

  private static getUserRoles(userId: string): UserRole[] {
    return this.userRoles.get(userId) || [];
  }

  private static getUserPermissionsFromRoles(
    userId: string,
    userRoles: UserRole[]
  ): Permission[] {
    const permissions: Permission[] = [];

    for (const userRole of userRoles) {
      if (!userRole.isActive) continue;

      if (userRole.expiresAt && userRole.expiresAt < new Date()) continue;

      const role = this.roles.get(userRole.roleId);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    return permissions;
  }

  private static hasExplicitPermission(
    permissions: Permission[],
    resource: string,
    action: string,
    context: Record<string, any>
  ): boolean {
    return permissions.some(permission => {
      if (permission.resource !== resource && permission.resource !== '*') {
        return false;
      }

      if (permission.action !== action && permission.action !== '*') {
        return false;
      }

      // Check conditions
      if (permission.conditions) {
        for (const [key, value] of Object.entries(permission.conditions)) {
          if (value === 'self' && context.userId !== context.currentUserId) {
            return false;
          }

          if (value !== 'self' && context[key] !== value) {
            return false;
          }
        }
      }

      return true;
    });
  }

  private static hasWildcardPermission(
    permissions: Permission[],
    resource: string,
    action: string
  ): boolean {
    return permissions.some(
      permission => permission.resource === '*' && permission.action === '*'
    );
  }

  private static hasAdminPermission(userRoles: UserRole[]): boolean {
    return userRoles.some(userRole => {
      if (!userRole.isActive) return false;

      const role = this.roles.get(userRole.roleId);
      return role && (role.level === 'admin' || role.level === 'system');
    });
  }

  private static async logAccessDenied(
    userId: string,
    resource: string,
    action: string,
    context: Record<string, any>
  ): Promise<void> {
    await AuditTrailService.createAuditEvent(
      userId,
      'access_denied',
      'access_control',
      `${resource}:${action}`,
      { resource, action, context },
      { severity: 'medium', category: 'authorization' }
    );
  }

  private static generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for users with too many roles
    for (const [userId, userRoles] of this.userRoles.entries()) {
      if (userRoles.length > 3) {
        recommendations.push(
          `User ${userId} has ${userRoles.length} roles - consider consolidating`
        );
      }
    }

    // Check for expired roles
    for (const [userId, userRoles] of this.userRoles.entries()) {
      const expiredRoles = userRoles.filter(
        ur => ur.expiresAt && ur.expiresAt < new Date() && ur.isActive
      );

      if (expiredRoles.length > 0) {
        recommendations.push(
          `User ${userId} has ${expiredRoles.length} expired roles that should be deactivated`
        );
      }
    }

    // Check for high-privilege users
    let highPrivilegeCount = 0;
    for (const userRoles of this.userRoles.values()) {
      for (const userRole of userRoles) {
        if (userRole.isActive) {
          const role = this.roles.get(userRole.roleId);
          if (role && (role.level === 'admin' || role.level === 'system')) {
            highPrivilegeCount++;
          }
        }
      }
    }

    if (highPrivilegeCount > 5) {
      recommendations.push(
        `High number of high-privilege users (${highPrivilegeCount}) - review necessity`
      );
    }

    return recommendations;
  }
}
