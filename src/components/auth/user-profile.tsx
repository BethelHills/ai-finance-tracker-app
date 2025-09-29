'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Save,
  Loader2,
  Edit,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user, signOut, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await updateProfile({
        full_name: profileData.full_name,
      });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <User className='h-5 w-5' />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>
            Manage your account settings and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar Section */}
          <div className='flex items-center space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className='text-lg'>
                {getInitials(profileData.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-lg font-semibold'>
                {profileData.full_name || 'User'}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {profileData.email}
              </p>
              <Badge variant='outline' className='mt-1'>
                <Shield className='h-3 w-3 mr-1' />
                Verified Account
              </Badge>
            </div>
          </div>

          {/* Profile Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              {isEditing ? (
                <Input
                  id='fullName'
                  value={profileData.full_name}
                  onChange={e =>
                    setProfileData(prev => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder='Enter your full name'
                />
              ) : (
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <span>{profileData.full_name || 'Not set'}</span>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='flex items-center space-x-2'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>{profileData.email}</span>
                <Badge variant='secondary' className='text-xs'>
                  Verified
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className='space-y-2'>
            <Label>Account Status</Label>
            <div className='flex items-center space-x-4'>
              <Badge variant='outline' className='flex items-center space-x-1'>
                <Shield className='h-3 w-3' />
                <span>Secure</span>
              </Badge>
              <Badge variant='outline' className='flex items-center space-x-1'>
                <Check className='h-3 w-3' />
                <span>Active</span>
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center space-x-2 pt-4 border-t'>
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isUpdating} size='sm'>
                  {isUpdating ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button onClick={handleCancel} variant='outline' size='sm'>
                  <X className='mr-2 h-4 w-4' />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant='outline'
                size='sm'
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Shield className='h-5 w-5' />
            <span>Security</span>
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert>
            <Shield className='h-4 w-4' />
            <AlertDescription>
              Your financial data is encrypted and stored securely. All
              sensitive information is protected with industry-standard
              encryption.
            </AlertDescription>
          </Alert>

          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Sign Out</h4>
              <p className='text-sm text-muted-foreground'>
                Sign out of your account on this device
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              variant='outline'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className='mr-2 h-4 w-4' />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
