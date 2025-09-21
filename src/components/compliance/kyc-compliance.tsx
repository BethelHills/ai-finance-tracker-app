'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Upload,
  Download,
  Eye,
  Clock,
  User,
  Building2,
  CreditCard,
  Globe,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KYCProfile {
  id: string;
  userId: string;
  status: 'pending' | 'verified' | 'rejected' | 'requires_review';
  level: 'basic' | 'enhanced' | 'premium';
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  documents: KYCDocument[];
  riskScore: number;
  lastVerified: Date;
  verificationProvider: 'internal' | 'jumio' | 'onfido' | 'trulioo';
  complianceFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface KYCDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'proof_of_address';
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  uploadedAt: Date;
  expiryDate?: Date;
  fileUrl: string;
  verificationData?: Record<string, any>;
}

interface ComplianceCheck {
  id: string;
  type: 'sanctions' | 'pep' | 'adverse_media' | 'watchlist' | 'aml';
  status: 'clean' | 'hit' | 'pending' | 'error';
  riskLevel: 'low' | 'medium' | 'high';
  details: string;
  checkedAt: Date;
  provider: string;
  confidence: number;
}

interface DocumentRetentionPolicy {
  id: string;
  documentType: string;
  retentionPeriod: number; // in days
  autoDelete: boolean;
  archiveLocation: string;
  lastUpdated: Date;
}

export function KYCCompliance() {
  const [kycProfile, setKycProfile] = useState<KYCProfile | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<DocumentRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKYCData();
  }, []);

  const loadKYCData = async () => {
    try {
      setLoading(true);
      const [kycResponse, checksResponse, policiesResponse] = await Promise.all([
        fetch('/api/compliance/kyc-profile'),
        fetch('/api/compliance/kyc-checks'),
        fetch('/api/compliance/retention-policies')
      ]);

      if (kycResponse.ok) {
        const kycData = await kycResponse.json();
        setKycProfile(kycData.profile);
      }

      if (checksResponse.ok) {
        const checksData = await checksResponse.json();
        setComplianceChecks(checksData.checks);
      }

      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json();
        setRetentionPolicies(policiesData.policies);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load KYC data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/compliance/kyc/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
        });
        loadKYCData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const runComplianceChecks = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/compliance/kyc/run-checks', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Compliance checks initiated',
        });
        loadKYCData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run compliance checks',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading KYC data...</span>
      </div>
    );
  }

  const completedDocuments = kycProfile?.documents.filter(doc => doc.status === 'approved').length || 0;
  const totalDocuments = kycProfile?.documents.length || 0;
  const documentProgress = totalDocuments > 0 ? (completedDocuments / totalDocuments) * 100 : 0;

  const highRiskChecks = complianceChecks.filter(check => check.riskLevel === 'high').length;
  const cleanChecks = complianceChecks.filter(check => check.status === 'clean').length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">KYC Compliance & Document Management</h2>
        <p className="text-muted-foreground">
          Manage customer verification and compliance requirements
        </p>
      </div>

      {/* KYC Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kycProfile?.status ? kycProfile.status.charAt(0).toUpperCase() + kycProfile.status.slice(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {kycProfile?.level || 'Basic'} Level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedDocuments}/{totalDocuments}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(documentProgress)}% Complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (kycProfile?.riskScore || 0) < 30 ? 'text-green-600' :
              (kycProfile?.riskScore || 0) < 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {kycProfile?.riskScore || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {kycProfile?.riskScore < 30 ? 'Low Risk' : 
               kycProfile?.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cleanChecks}/{complianceChecks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {highRiskChecks} High Risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main KYC Interface */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">KYC Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
          <TabsTrigger value="retention">Document Retention</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <KYCProfileTab profile={kycProfile} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentsTab
            documents={kycProfile?.documents || []}
            onUpload={handleDocumentUpload}
            submitting={submitting}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceChecksTab
            checks={complianceChecks}
            onRunChecks={runComplianceChecks}
            submitting={submitting}
          />
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <DocumentRetentionTab policies={retentionPolicies} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ComplianceReportsTab profile={kycProfile} checks={complianceChecks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KYCProfileTab({ profile }: { profile: KYCProfile | null }) {
  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No KYC profile found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-sm text-gray-600">
                {profile.personalInfo.firstName} {profile.personalInfo.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <p className="text-sm text-gray-600">
                {profile.personalInfo.dateOfBirth.toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Nationality</label>
              <p className="text-sm text-gray-600">{profile.personalInfo.nationality}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <p className="text-sm text-gray-600">
                {profile.personalInfo.address.street}, {profile.personalInfo.address.city}, 
                {profile.personalInfo.address.state} {profile.personalInfo.address.postalCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Verification Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Verification Level</span>
              <Badge className={
                profile.level === 'premium' ? 'bg-purple-100 text-purple-800' :
                profile.level === 'enhanced' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }>
                {profile.level.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Status</span>
              <Badge className={
                profile.status === 'verified' ? 'bg-green-100 text-green-800' :
                profile.status === 'rejected' ? 'bg-red-100 text-red-800' :
                profile.status === 'requires_review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {profile.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Verification Provider</span>
              <span className="text-sm text-gray-600">{profile.verificationProvider}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Last Verified</span>
              <span className="text-sm text-gray-600">
                {profile.lastVerified.toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.complianceFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Compliance Flags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.complianceFlags.map((flag, index) => (
                <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-orange-800">{flag}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentsTab({
  documents,
  onUpload,
  submitting,
}: {
  documents: KYCDocument[];
  onUpload: (file: File, documentType: string) => void;
  submitting: boolean;
}) {
  const documentTypes = [
    { value: 'passport', label: 'Passport', required: true },
    { value: 'drivers_license', label: 'Driver\'s License', required: false },
    { value: 'national_id', label: 'National ID', required: true },
    { value: 'utility_bill', label: 'Utility Bill', required: true },
    { value: 'bank_statement', label: 'Bank Statement', required: false },
    { value: 'proof_of_address', label: 'Proof of Address', required: true },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, documentType);
    }
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.type === documentType);
    return doc?.status || 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Required Documents</span>
          </CardTitle>
          <CardDescription>
            Upload the required documents for KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.value);
              const doc = documents.find(d => d.type === docType.value);

              return (
                <div key={docType.value} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <h4 className="font-medium">{docType.label}</h4>
                      {docType.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {doc && (
                        <p className="text-sm text-gray-600">
                          Uploaded: {doc.uploadedAt.toLocaleDateString()}
                          {doc.expiryDate && ` • Expires: ${doc.expiryDate.toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={
                      status === 'approved' ? 'bg-green-100 text-green-800' :
                      status === 'rejected' ? 'bg-red-100 text-red-800' :
                      status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      status === 'expired' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {status}
                    </Badge>

                    <div>
                      <input
                        type="file"
                        id={`upload-${docType.value}`}
                        onChange={(e) => handleFileUpload(e, docType.value)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label htmlFor={`upload-${docType.value}`}>
                        <Button variant="outline" size="sm" disabled={submitting}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      </label>
                    </div>

                    {doc && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Manage your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-gray-600">
                      {document.type.replace('_', ' ').toUpperCase()} • 
                      Uploaded: {document.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={
                    document.status === 'approved' ? 'bg-green-100 text-green-800' :
                    document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }>
                    {document.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No documents uploaded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComplianceChecksTab({
  checks,
  onRunChecks,
  submitting,
}: {
  checks: ComplianceCheck[];
  onRunChecks: () => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Compliance Checks</span>
          </CardTitle>
          <CardDescription>
            Monitor compliance checks and risk assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check) => (
              <div key={check.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{check.type.toUpperCase()}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      check.status === 'clean' ? 'bg-green-100 text-green-800' :
                      check.status === 'hit' ? 'bg-red-100 text-red-800' :
                      check.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {check.status}
                    </Badge>
                    <Badge className={
                      check.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      check.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {check.riskLevel} Risk
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{check.details}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Provider: {check.provider}</span>
                  <span>Confidence: {Math.round(check.confidence * 100)}%</span>
                  <span>Checked: {check.checkedAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {checks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No compliance checks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Compliance Checks</CardTitle>
          <CardDescription>
            Initiate new compliance checks for the customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRunChecks} disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Checks...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Compliance Checks
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentRetentionTab({ policies }: { policies: DocumentRetentionPolicy[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Document Retention Policies</span>
        </CardTitle>
        <CardDescription>
          Manage document retention and archival policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{policy.documentType}</h4>
                <Badge variant="outline">
                  {policy.retentionPeriod} days
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Auto Delete: {policy.autoDelete ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-gray-600">
                Archive Location: {policy.archiveLocation}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last Updated: {policy.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          ))}

          {policies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No retention policies configured</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceReportsTab({
  profile,
  checks,
}: {
  profile: KYCProfile | null;
  checks: ComplianceCheck[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Compliance Reports</span>
        </CardTitle>
        <CardDescription>
          Generate compliance and audit reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Compliance reporting features coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
