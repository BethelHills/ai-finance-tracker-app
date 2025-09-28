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
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  Globe,
  DollarSign,
  Building2,
  Users,
  Loader2,
} from 'lucide-react';
import {
  ComplianceManager,
  ProviderName,
  UserTier,
} from '@/lib/compliance/provider-requirements';

interface ProviderComplianceCheckerProps {
  selectedProvider: ProviderName;
  userTier: UserTier;
  onComplianceChange?: (compliant: boolean) => void;
}

export function ProviderComplianceChecker({
  selectedProvider,
  userTier,
  onComplianceChange,
}: ProviderComplianceCheckerProps) {
  const [compliance, setCompliance] = useState<{
    compliant: boolean;
    missingRequirements: string[];
    complianceScore: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkCompliance();
  }, [selectedProvider, userTier]);

  const checkCompliance = async () => {
    setLoading(true);
    try {
      const result = await ComplianceManager.checkProviderCompliance(
        'user_123', // This would come from your auth context
        selectedProvider
      );
      setCompliance(result);
      onComplianceChange?.(result.compliant);
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const requirements =
    ComplianceManager.getProviderRequirements(selectedProvider);
  const transferLimits = ComplianceManager.getTransferLimits(
    selectedProvider,
    userTier
  );
  const supportedCurrencies =
    ComplianceManager.getSupportedCurrencies(selectedProvider);
  const complianceStandards =
    ComplianceManager.getComplianceStandards(selectedProvider);

  if (!requirements) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center text-red-600'>
            <AlertTriangle className='h-8 w-8 mx-auto mb-2' />
            <p>Unknown provider: {selectedProvider}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Provider Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Shield className='h-5 w-5' />
            <span>{requirements.name} Compliance</span>
          </CardTitle>
          <CardDescription>
            Compliance requirements and status for {requirements.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Globe className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium'>Region:</span>
                <span className='text-sm'>{requirements.region}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <DollarSign className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium'>Currencies:</span>
                <div className='flex space-x-1'>
                  {supportedCurrencies.map(currency => (
                    <Badge key={currency} variant='outline' className='text-xs'>
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Building2 className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium'>
                  Business Registration:
                </span>
                <Badge
                  variant={
                    requirements.businessRegistration
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {requirements.businessRegistration
                    ? 'Required'
                    : 'Not Required'}
                </Badge>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Users className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium'>KYC Level:</span>
                <Badge
                  variant={
                    requirements.kycLevel === 'premium'
                      ? 'destructive'
                      : requirements.kycLevel === 'enhanced'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {requirements.kycLevel.toUpperCase()}
                </Badge>
              </div>
              <div className='flex items-center space-x-2'>
                <Shield className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium'>Standards:</span>
                <div className='flex flex-wrap gap-1'>
                  {complianceStandards.slice(0, 2).map(standard => (
                    <Badge key={standard} variant='outline' className='text-xs'>
                      {standard}
                    </Badge>
                  ))}
                  {complianceStandards.length > 2 && (
                    <Badge variant='outline' className='text-xs'>
                      +{complianceStandards.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <CheckCircle className='h-5 w-5' />
            <span>Compliance Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='ml-2'>Checking compliance...</span>
            </div>
          ) : compliance ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>Overall Compliance</span>
                <Badge
                  variant={compliance.compliant ? 'default' : 'destructive'}
                >
                  {compliance.compliant ? 'Compliant' : 'Non-Compliant'}
                </Badge>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Compliance Score</span>
                  <span>{compliance.complianceScore}%</span>
                </div>
                <Progress value={compliance.complianceScore} className='h-2' />
              </div>

              {compliance.missingRequirements.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium text-red-600'>
                    Missing Requirements:
                  </h4>
                  <ul className='space-y-1'>
                    {compliance.missingRequirements.map(
                      (requirement, index) => (
                        <li
                          key={index}
                          className='flex items-center space-x-2 text-sm text-red-600'
                        >
                          <AlertTriangle className='h-4 w-4' />
                          <span>{requirement}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-4'>
              <p className='text-gray-500'>Unable to check compliance status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Limits */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <DollarSign className='h-5 w-5' />
            <span>Transfer Limits ({userTier.toUpperCase()})</span>
          </CardTitle>
          <CardDescription>
            Transaction limits for your account tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>
                {transferLimits.single.toLocaleString()}
              </div>
              <div className='text-sm text-gray-600'>Single Transaction</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>
                {transferLimits.daily.toLocaleString()}
              </div>
              <div className='text-sm text-gray-600'>Daily Limit</div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>
                {transferLimits.monthly.toLocaleString()}
              </div>
              <div className='text-sm text-gray-600'>Monthly Limit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <FileText className='h-5 w-5' />
            <span>Required Documents</span>
          </CardTitle>
          <CardDescription>
            Documents needed for {requirements.name} compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {requirements.requiredDocuments.map((document, index) => (
              <div
                key={index}
                className='flex items-center space-x-2 p-2 border rounded-lg'
              >
                <FileText className='h-4 w-4 text-gray-500' />
                <span className='text-sm'>{document}</span>
                <Badge variant='outline' className='ml-auto'>
                  Required
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Standards */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Shield className='h-5 w-5' />
            <span>Compliance Standards</span>
          </CardTitle>
          <CardDescription>
            Regulatory standards and certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {complianceStandards.map((standard, index) => (
              <div
                key={index}
                className='flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg'
              >
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='text-sm text-green-800'>{standard}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage your compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-2'>
            <Button onClick={checkCompliance} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Recheck Compliance
                </>
              )}
            </Button>
            <Button variant='outline'>
              <FileText className='h-4 w-4 mr-2' />
              Upload Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Provider selection component
export function ProviderSelector({
  selectedProvider,
  onProviderChange,
  userTier,
}: {
  selectedProvider: ProviderName;
  onProviderChange: (provider: ProviderName) => void;
  userTier: UserTier;
}) {
  const providers = Object.keys(
    ComplianceManager.getComplianceSummary()
  ) as ProviderName[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Provider</CardTitle>
        <CardDescription>
          Choose a provider to view compliance requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {providers.map(provider => {
            const requirements =
              ComplianceManager.getProviderRequirements(provider);
            const transferLimits = ComplianceManager.getTransferLimits(
              provider,
              userTier
            );

            return (
              <div
                key={provider}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProvider === provider
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onProviderChange(provider)}
              >
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>{requirements?.name}</h4>
                    <Badge
                      variant={
                        requirements?.businessRegistration
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {requirements?.businessRegistration
                        ? 'Business Required'
                        : 'Personal OK'}
                    </Badge>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {requirements?.region}
                  </p>
                  <div className='flex space-x-1'>
                    {requirements?.currencies.slice(0, 3).map(currency => (
                      <Badge
                        key={currency}
                        variant='outline'
                        className='text-xs'
                      >
                        {currency}
                      </Badge>
                    ))}
                    {(requirements?.currencies?.length ?? 0) > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{(requirements?.currencies?.length ?? 0) - 3}
                      </Badge>
                    )}
                  </div>
                  <div className='text-xs text-gray-500'>
                    Daily Limit: {transferLimits.daily.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
