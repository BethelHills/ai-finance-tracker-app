'use client';

import { useState } from 'react';
import { User, Settings, Save, X } from 'lucide-react';
import { useUserSettings } from '@/contexts/user-settings-context';
import { useToast } from '@/hooks/use-toast';
import { CURRENCIES, THEMES } from '@/types/user';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ProfileSettings() {
  const { settings, updateSettings } = useUserSettings();
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    updateSettings(formData);
    success('Settings saved successfully!');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setFormData(settings);
    setIsOpen(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Settings className='h-4 w-4 mr-2' />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <User className='h-5 w-5' />
            <span>Profile Settings</span>
          </DialogTitle>
          <DialogDescription>
            Customize your account preferences and notification settings.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Currency & Budget</CardTitle>
              <CardDescription>
                Set your preferred currency and monthly budget limit.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='currency'>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={value =>
                      handleInputChange('currency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select currency' />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className='flex items-center space-x-2'>
                            <span>{currency.symbol}</span>
                            <span>{currency.name}</span>
                            <span className='text-muted-foreground'>
                              ({currency.code})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='monthlyBudget'>Monthly Budget</Label>
                  <Input
                    id='monthlyBudget'
                    type='number'
                    min='0'
                    step='100'
                    value={formData.monthlyBudget}
                    onChange={e =>
                      handleInputChange('monthlyBudget', Number(e.target.value))
                    }
                    placeholder='5000'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Appearance</CardTitle>
              <CardDescription>
                Choose your preferred theme for the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label>Theme</Label>
                <div className='grid grid-cols-3 gap-3'>
                  {THEMES.map(theme => (
                    <Button
                      key={theme.value}
                      variant={
                        formData.theme === theme.value ? 'default' : 'outline'
                      }
                      onClick={() => handleInputChange('theme', theme.value)}
                      className='flex flex-col items-center space-y-1 h-auto py-3'
                    >
                      <span className='text-lg'>{theme.icon}</span>
                      <span className='text-sm'>{theme.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Email Notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.email}
                  onCheckedChange={value =>
                    handleNotificationChange('email', value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Push Notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.push}
                  onCheckedChange={value =>
                    handleNotificationChange('push', value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Transaction Alerts</Label>
                  <p className='text-sm text-muted-foreground'>
                    Get notified about new transactions
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.transaction}
                  onCheckedChange={value =>
                    handleNotificationChange('transaction', value)
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Budget Alerts</Label>
                  <p className='text-sm text-muted-foreground'>
                    Get notified when approaching budget limits
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.budget}
                  onCheckedChange={value =>
                    handleNotificationChange('budget', value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <Button variant='outline' onClick={handleCancel}>
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className='h-4 w-4 mr-2' />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
