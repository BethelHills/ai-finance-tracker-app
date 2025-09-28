'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Upload,
  Download,
  Shield,
  Users,
  CreditCard,
  Globe,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BusinessRegistration {
  id: string;
  businessName: string;
  businessType: 'individual' | 'partnership' | 'corporation' | 'llc';
  registrationNumber: string;
  taxId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  complianceStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: BusinessDocument[];
  createdAt: Date;
  updatedAt: Date;
}

interface BusinessDocument {
  id: string;
  type:
    | 'certificate'
    | 'tax_id'
    | 'bank_statement'
    | 'utility_bill'
    | 'business_license';
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  fileUrl: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'completed' | 'not_required';
  documentType?: string;
  dueDate?: Date;
}

export function BusinessRegistration() {
  const [registration, setRegistration] = useState<BusinessRegistration | null>(
    null
  );
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessRegistration();
  }, []);

  const loadBusinessRegistration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/business-registration');
      if (response.ok) {
        const data = await response.json();
        setRegistration(data.registration);
        setRequirements(data.requirements);
      }
    } catch (error) {
      toast.error('Failed to load business registration');
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

      const response = await fetch('/api/compliance/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Document uploaded successfully');
        loadBusinessRegistration();
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRegistration = async () => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/compliance/submit-registration', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Business registration submitted for review');
        loadBusinessRegistration();
      }
    } catch (error) {
      toast.error('Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading business registration...</span>
      </div>
    );
  }

  const completedRequirements = requirements.filter(
    req => req.status === 'completed'
  ).length;
  const totalRequirements = requirements.filter(req => req.required).length;
  const progress =
    totalRequirements > 0
      ? (completedRequirements / totalRequirements) * 100
      : 0;

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold'>
          Business Registration & Compliance
        </h2>
        <p className='text-muted-foreground'>
          Complete your business registration to enable payment processing
        </p>
      </div>

      {/* Progress Overview */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Shield className='h-5 w-5' />
            <span>Compliance Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium'>Overall Progress</span>
              <span className='text-sm text-gray-600'>
                {completedRequirements} of {totalRequirements} requirements
                completed
              </span>
            </div>
            <Progress value={progress} className='h-2' />
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>0%</span>
              <span className='text-gray-600'>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Building2 className='h-5 w-5' />
            <span>Business Information</span>
          </CardTitle>
          <CardDescription>
            Provide your business details for registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessInfoForm registration={registration} />
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <FileText className='h-5 w-5' />
            <span>Compliance Requirements</span>
          </CardTitle>
          <CardDescription>
            Upload required documents for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {requirements.map(requirement => (
              <ComplianceRequirementCard
                key={requirement.id}
                requirement={requirement}
                onUpload={handleDocumentUpload}
                submitting={submitting}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Upload className='h-5 w-5' />
            <span>Document Management</span>
          </CardTitle>
          <CardDescription>
            Manage your uploaded business documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentManagementSection
            documents={registration?.documents || []}
            onUpload={handleDocumentUpload}
            submitting={submitting}
          />
        </CardContent>
      </Card>

      {/* Submit Registration */}
      <Card>
        <CardHeader>
          <CardTitle>Submit for Review</CardTitle>
          <CardDescription>
            Submit your business registration for compliance review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              {progress === 100 ? (
                <CheckCircle className='h-5 w-5 text-green-600' />
              ) : (
                <AlertTriangle className='h-5 w-5 text-yellow-600' />
              )}
              <span className='text-sm'>
                {progress === 100
                  ? 'All requirements completed - ready to submit'
                  : `${Math.round(progress)}% complete - more requirements needed`}
              </span>
            </div>

            <Button
              onClick={handleSubmitRegistration}
              disabled={progress < 100 || submitting}
              className='w-full'
            >
              {submitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className='h-4 w-4 mr-2' />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessInfoForm({
  registration,
}: {
  registration: BusinessRegistration | null;
}) {
  const [formData, setFormData] = useState({
    businessName: registration?.businessName || '',
    businessType: registration?.businessType || 'individual',
    registrationNumber: registration?.registrationNumber || '',
    taxId: registration?.taxId || '',
    street: registration?.address.street || '',
    city: registration?.address.city || '',
    state: registration?.address.state || '',
    country: registration?.address.country || 'Nigeria',
    postalCode: registration?.address.postalCode || '',
    email: registration?.contactInfo.email || '',
    phone: registration?.contactInfo.phone || '',
    website: registration?.contactInfo.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium'>Business Name</label>
          <Input
            value={formData.businessName}
            onChange={e =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            placeholder='Enter business name'
            required
          />
        </div>
        <div>
          <label className='text-sm font-medium'>Business Type</label>
          <Select
            value={formData.businessType}
            onValueChange={value =>
              setFormData({ ...formData, businessType: value as any })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select business type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='individual'>Individual</SelectItem>
              <SelectItem value='partnership'>Partnership</SelectItem>
              <SelectItem value='corporation'>Corporation</SelectItem>
              <SelectItem value='llc'>LLC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='text-sm font-medium'>Registration Number</label>
          <Input
            value={formData.registrationNumber}
            onChange={e =>
              setFormData({ ...formData, registrationNumber: e.target.value })
            }
            placeholder='RC123456789'
          />
        </div>
        <div>
          <label className='text-sm font-medium'>Tax ID</label>
          <Input
            value={formData.taxId}
            onChange={e => setFormData({ ...formData, taxId: e.target.value })}
            placeholder='12345678901'
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h4 className='font-medium'>Business Address</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='text-sm font-medium'>Street Address</label>
            <Input
              value={formData.street}
              onChange={e =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder='123 Main Street'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>City</label>
            <Input
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder='Lagos'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>State</label>
            <Input
              value={formData.state}
              onChange={e =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder='Lagos State'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Country</label>
            <Input
              value={formData.country}
              onChange={e =>
                setFormData({ ...formData, country: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Postal Code</label>
            <Input
              value={formData.postalCode}
              onChange={e =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              placeholder='100001'
              required
            />
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h4 className='font-medium'>Contact Information</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium'>Email</label>
            <Input
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder='business@example.com'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Phone</label>
            <Input
              value={formData.phone}
              onChange={e =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder='+234 800 000 0000'
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label className='text-sm font-medium'>Website (Optional)</label>
            <Input
              value={formData.website}
              onChange={e =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder='https://www.example.com'
            />
          </div>
        </div>
      </div>

      <Button type='submit' className='w-full'>
        Save Business Information
      </Button>
    </form>
  );
}

function ComplianceRequirementCard({
  requirement,
  onUpload,
  submitting,
}: {
  requirement: ComplianceRequirement;
  onUpload: (file: File, documentType: string) => void;
  submitting: boolean;
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && requirement.documentType) {
      onUpload(file, requirement.documentType);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'pending':
        return <AlertTriangle className='h-5 w-5 text-yellow-600' />;
      default:
        return <AlertTriangle className='h-5 w-5 text-gray-400' />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-green-100 text-green-800'>Completed</Badge>;
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      default:
        return <Badge variant='outline'>Not Required</Badge>;
    }
  };

  return (
    <div className='flex items-center justify-between p-4 border rounded-lg'>
      <div className='flex items-center space-x-3'>
        {getStatusIcon(requirement.status)}
        <div>
          <h4 className='font-medium'>{requirement.title}</h4>
          <p className='text-sm text-gray-600'>{requirement.description}</p>
          {requirement.dueDate && (
            <p className='text-xs text-gray-500'>
              Due: {requirement.dueDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className='flex items-center space-x-3'>
        {getStatusBadge(requirement.status)}
        {requirement.required && requirement.status !== 'completed' && (
          <div>
            <input
              type='file'
              id={`upload-${requirement.id}`}
              onChange={handleFileUpload}
              className='hidden'
              accept='.pdf,.jpg,.jpeg,.png'
            />
            <label
              htmlFor={`upload-${requirement.id}`}
              className='cursor-pointer'
            >
              <Button variant='outline' size='sm' disabled={submitting}>
                <Upload className='h-4 w-4 mr-2' />
                Upload
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentManagementSection({
  documents,
  onUpload,
  submitting,
}: {
  documents: BusinessDocument[];
  onUpload: (file: File, documentType: string) => void;
  submitting: boolean;
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const documentType = e.target.dataset.documentType;
    if (file && documentType) {
      onUpload(file, documentType);
    }
  };

  return (
    <div className='space-y-4'>
      {documents.map(document => (
        <div
          key={document.id}
          className='flex items-center justify-between p-3 border rounded-lg'
        >
          <div className='flex items-center space-x-3'>
            <FileText className='h-5 w-5 text-gray-400' />
            <div>
              <h4 className='font-medium'>{document.name}</h4>
              <p className='text-sm text-gray-600'>
                Uploaded: {document.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge
              className={
                document.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : document.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }
            >
              {document.status}
            </Badge>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ))}

      {documents.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
}
