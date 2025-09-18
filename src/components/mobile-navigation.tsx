'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Home,
  CreditCard,
  Target,
  TrendingUp,
  PieChart,
  BarChart3,
  Settings,
  User,
  Bell,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'Transactions', href: '#', icon: CreditCard, current: false },
  { name: 'AI Insights', href: '#', icon: TrendingUp, current: false },
  { name: 'Budgets', href: '#', icon: Target, current: false },
  { name: 'Analytics', href: '#', icon: BarChart3, current: false },
  { name: 'Reports', href: '#', icon: PieChart, current: false },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className='lg:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='md:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64'>
          <div className='flex flex-col h-full'>
            {/* Logo */}
            <div className='flex items-center space-x-2 px-4 py-4 border-b'>
              <div className='h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>AI</span>
              </div>
              <span className='text-lg font-bold'>Finance Tracker</span>
            </div>

            {/* Navigation */}
            <nav className='flex-1 px-4 py-4 space-y-2'>
              {navigation.map(item => (
                <Button
                  key={item.name}
                  variant={item.current ? 'secondary' : 'ghost'}
                  className='w-full justify-start'
                  onClick={() => setOpen(false)}
                >
                  <item.icon className='h-4 w-4 mr-3' />
                  {item.name}
                  {item.name === 'AI Insights' && (
                    <Badge variant='outline' className='ml-auto text-xs'>
                      AI
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            {/* User Section */}
            <div className='px-4 py-4 border-t'>
              <div className='flex items-center space-x-3'>
                <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center'>
                  <User className='h-4 w-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>John Doe</p>
                  <p className='text-xs text-muted-foreground truncate'>
                    john@example.com
                  </p>
                </div>
                <Button variant='ghost' size='icon'>
                  <Bell className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function MobileHeader() {
  return (
    <div className='lg:hidden flex items-center justify-between px-4 py-3 border-b bg-background'>
      <div className='flex items-center space-x-3'>
        <MobileNavigation />
        <div className='flex items-center space-x-2'>
          <div className='h-6 w-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
            <span className='text-white font-bold text-xs'>AI</span>
          </div>
          <span className='font-semibold'>Finance</span>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button variant='ghost' size='icon'>
          <Search className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon'>
          <Bell className='h-4 w-4' />
        </Button>
        <Button variant='ghost' size='icon'>
          <Settings className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
