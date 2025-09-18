'use client';

import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/user-menu';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='icon'>
            <Menu className='h-5 w-5' />
          </Button>
          <div className='flex items-center space-x-2'>
            <div className='h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>AI</span>
            </div>
            <h1 className='text-xl font-bold'>Finance Tracker</h1>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Search transactions, budgets...'
              className='pl-10 w-64'
            />
          </div>

          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
            {notifications > 0 && (
              <Badge className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'>
                {notifications}
              </Badge>
            )}
          </Button>

          <ThemeToggle />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
