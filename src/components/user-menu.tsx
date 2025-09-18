'use client';

import { useState } from 'react';
import { User, Settings, LogOut, CreditCard, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfileSettings } from '@/components/profile-settings';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { success } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
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

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>
                {user.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{user.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className='mr-2 h-4 w-4' />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BarChart3 className='mr-2 h-4 w-4' />
            <span>Analytics</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showSettings && <ProfileSettings />}
    </>
  );
}
