'use client';

import { useState } from 'react';
import {
  Home,
  CreditCard,
  Target,
  TrendingUp,
  PieChart,
  Settings,
  HelpCircle,
  Brain,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'Transactions', href: '#', icon: CreditCard, current: false },
  { name: 'AI Insights', href: '#', icon: Brain, current: false },
  { name: 'Budgets', href: '#', icon: Target, current: false },
  { name: 'Goals', href: '#', icon: TrendingUp, current: false },
  { name: 'Analytics', href: '#', icon: BarChart3, current: false },
  { name: 'Reports', href: '#', icon: PieChart, current: false },
];

const aiFeatures = [
  {
    name: 'Smart Categorization',
    description: 'AI-powered transaction sorting',
  },
  { name: 'Predictive Analytics', description: 'Forecast spending patterns' },
  {
    name: 'Budget Optimization',
    description: 'AI-recommended budget adjustments',
  },
  {
    name: 'Investment Insights',
    description: 'Market analysis and recommendations',
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-card border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className='flex-1 px-4 py-6'>
        <nav className='space-y-2'>
          {navigation.map(item => (
            <Button
              key={item.name}
              variant={item.current ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isCollapsed ? 'px-2' : 'px-3'
              )}
            >
              <item.icon className='h-5 w-5' />
              {!isCollapsed && <span className='ml-3'>{item.name}</span>}
            </Button>
          ))}
        </nav>

        {!isCollapsed && (
          <div className='mt-8'>
            <h3 className='px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              AI Features
            </h3>
            <div className='mt-2 space-y-1'>
              {aiFeatures.map(feature => (
                <div
                  key={feature.name}
                  className='px-3 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors'
                >
                  <div className='text-sm font-medium'>{feature.name}</div>
                  <div className='text-xs text-muted-foreground'>
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className='p-4 border-t'>
        <div className='flex items-center space-x-3'>
          <Button variant='ghost' size='icon'>
            <Settings className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='icon'>
            <HelpCircle className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsCollapsed(!isCollapsed)}
            className='ml-auto'
          >
            <div className='h-5 w-5 flex flex-col justify-center'>
              <div className='w-3 h-0.5 bg-current mb-1'></div>
              <div className='w-3 h-0.5 bg-current'></div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
