'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CreditCard, 
  Building2, 
  Eye, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  completed: boolean;
}

interface Permission {
  id: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  category: 'banking' | 'security' | 'data' | 'notifications';
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI Finance Tracker',
      description: 'Let\'s set up your secure financial management system',
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      required: true,
      completed: true,
    },
    {
      id: 'permissions',
      title: 'Permissions & Security',
      description: 'Review and grant necessary permissions for secure banking',
      icon: <Lock className="h-8 w-8 text-green-600" />,
      required: true,
      completed: false,
    },
    {
      id: 'bank-linking',
      title: 'Link Your Bank Account',
      description: 'Securely connect your bank account for transaction sync',
      icon: <Building2 className="h-8 w-8 text-purple-600" />,
      required: true,
      completed: false,
    },
    {
      id: 'verification',
      title: 'Identity Verification',
      description: 'Complete KYC verification for enhanced security',
      icon: <Eye className="h-8 w-8 text-orange-600" />,
      required: true,
      completed: false,
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'Your AI Finance Tracker is ready to use',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      required: true,
      completed: false,
    },
  ];

  useEffect(() => {
    // Initialize permissions
    setPermissions([
      {
        id: 'bank_access',
        title: 'Bank Account Access',
        description: 'Read-only access to your account balances and transaction history',
        required: true,
        granted: false,
        category: 'banking',
      },
      {
        id: 'transaction_sync',
        title: 'Transaction Synchronization',
        description: 'Automatically sync transactions from your bank account',
        required: true,
        granted: false,
        category: 'banking',
      },
      {
        id: 'ai_categorization',
        title: 'AI-Powered Categorization',
        description: 'Use AI to automatically categorize your transactions',
        required: false,
        granted: false,
        category: 'data',
      },
      {
        id: 'financial_insights',
        title: 'Financial Insights',
        description: 'Generate personalized financial insights and recommendations',
        required: false,
        granted: false,
        category: 'data',
      },
      {
        id: 'email_notifications',
        title: 'Email Notifications',
        description: 'Receive important updates and security alerts via email',
        required: true,
        granted: false,
        category: 'notifications',
      },
      {
        id: 'two_factor_auth',
        title: 'Two-Factor Authentication',
        description: 'Enable 2FA for enhanced account security',
        required: true,
        granted: false,
        category: 'security',
      },
    ]);
  }, []);

  const handlePermissionChange = (permissionId: string, granted: boolean) => {
    setPermissions(prev => 
      prev.map(p => p.id === permissionId ? { ...p, granted } : p)
    );
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Check if all required permissions are granted
      const requiredPermissions = permissions.filter(p => p.required);
      const grantedRequired = requiredPermissions.filter(p => p.granted);
      
      if (grantedRequired.length !== requiredPermissions.length) {
        toast({
          title: 'Required Permissions',
          description: 'Please grant all required permissions to continue',
          variant: 'destructive',
        });
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Save permissions and complete onboarding
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      toast({
        title: 'Onboarding Complete!',
        description: 'Your AI Finance Tracker is ready to use',
      });

      // Redirect to dashboard
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && (
              <PermissionsStep 
                permissions={permissions}
                onPermissionChange={handlePermissionChange}
              />
            )}
            {currentStep === 2 && <BankLinkingStep />}
            {currentStep === 3 && <VerificationStep />}
            {currentStep === 4 && <CompleteStep />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              'Processing...'
            ) : currentStep === steps.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">What you'll get:</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <h4 className="font-medium">Secure Bank Integration</h4>
            <p className="text-sm text-gray-600">Read-only access to sync your transactions</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <h4 className="font-medium">AI-Powered Insights</h4>
            <p className="text-sm text-gray-600">Smart categorization and financial analysis</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <h4 className="font-medium">Real-time Monitoring</h4>
            <p className="text-sm text-gray-600">Track your spending and savings goals</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
          <div>
            <h4 className="font-medium">Bank-Level Security</h4>
            <p className="text-sm text-gray-600">256-bit encryption and secure data handling</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionsStep({ 
  permissions, 
  onPermissionChange 
}: { 
  permissions: Permission[];
  onPermissionChange: (id: string, granted: boolean) => void;
}) {
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryIcons = {
    banking: <Building2 className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />,
    data: <Eye className="h-5 w-5" />,
    notifications: <CreditCard className="h-5 w-5" />,
  };

  const categoryTitles = {
    banking: 'Banking Access',
    security: 'Security Features',
    data: 'Data Processing',
    notifications: 'Notifications',
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Permissions & Security</h3>
        <p className="text-gray-600">
          We need your permission to provide secure financial services. 
          All data is encrypted and never shared with third parties.
        </p>
      </div>

      {Object.entries(groupedPermissions).map(([category, perms]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center space-x-2">
            {categoryIcons[category as keyof typeof categoryIcons]}
            <h4 className="font-medium">{categoryTitles[category as keyof typeof categoryTitles]}</h4>
          </div>
          
          <div className="space-y-3 pl-7">
            {perms.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-3">
                <Checkbox
                  id={permission.id}
                  checked={permission.granted}
                  onCheckedChange={(checked) => 
                    onPermissionChange(permission.id, checked as boolean)
                  }
                  disabled={permission.required}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={permission.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="font-medium">{permission.title}</span>
                    {permission.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Your Privacy is Protected</h4>
            <p className="text-sm text-blue-800 mt-1">
              We use bank-level encryption (AES-256) and never store your banking credentials. 
              All data access is read-only and follows strict security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankLinkingStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Link Your Bank Account</h3>
        <p className="text-gray-600">
          Securely connect your bank account to start syncing transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h4 className="font-medium">Supported Banks</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chase Bank</li>
            <li>• Bank of America</li>
            <li>• Wells Fargo</li>
            <li>• Capital One</li>
            <li>• And 10,000+ more</li>
          </ul>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="h-6 w-6 text-green-600" />
            <h4 className="font-medium">Security Features</h4>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 256-bit encryption</li>
            <li>• Read-only access</li>
            <li>• No credential storage</li>
            <li>• Bank-level security</li>
          </ul>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="w-full max-w-md">
          <Building2 className="h-5 w-5 mr-2" />
          Connect Bank Account
        </Button>
      </div>
    </div>
  );
}

function VerificationStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
        <p className="text-gray-600">
          Complete KYC verification for enhanced security and compliance
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium">Document Upload</h4>
            <p className="text-sm text-gray-600">Upload a government-issued ID</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium">Address Verification</h4>
            <p className="text-sm text-gray-600">Provide proof of address</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 border rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium">Selfie Verification</h4>
            <p className="text-sm text-gray-600">Take a selfie for identity confirmation</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" className="w-full max-w-md">
          Start Verification
        </Button>
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-semibold text-green-600 mb-2">
          Setup Complete!
        </h3>
        <p className="text-gray-600">
          Your AI Finance Tracker is ready to use. You can now securely manage 
          your finances with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Bank Account</h4>
          <p className="text-sm text-blue-800">Connected and syncing</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">Security</h4>
          <p className="text-sm text-green-800">2FA enabled</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900">AI Features</h4>
          <p className="text-sm text-purple-800">Ready to analyze</p>
        </div>
      </div>
    </div>
  );
}
