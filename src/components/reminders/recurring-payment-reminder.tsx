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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  DollarSign,
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecurringPayment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  isPaid: boolean;
  reminderDays: number;
  description?: string;
}

interface RecurringPaymentReminderProps {
  payments?: RecurringPayment[];
}

const mockPayments: RecurringPayment[] = [
  {
    id: '1',
    title: 'Rent Payment',
    amount: 1200,
    dueDate: '2024-02-01',
    frequency: 'monthly',
    category: 'Housing',
    isPaid: false,
    reminderDays: 3,
    description: 'Monthly rent for apartment',
  },
  {
    id: '2',
    title: 'Car Insurance',
    amount: 150,
    dueDate: '2024-02-15',
    frequency: 'monthly',
    category: 'Insurance',
    isPaid: false,
    reminderDays: 7,
    description: 'Monthly car insurance premium',
  },
  {
    id: '3',
    title: 'Netflix Subscription',
    amount: 15.99,
    dueDate: '2024-02-10',
    frequency: 'monthly',
    category: 'Entertainment',
    isPaid: true,
    reminderDays: 1,
    description: 'Monthly streaming subscription',
  },
  {
    id: '4',
    title: 'Gym Membership',
    amount: 49.99,
    dueDate: '2024-02-05',
    frequency: 'monthly',
    category: 'Health & Fitness',
    isPaid: false,
    reminderDays: 2,
    description: 'Monthly gym membership fee',
  },
  {
    id: '5',
    title: 'Internet Bill',
    amount: 79.99,
    dueDate: '2024-02-20',
    frequency: 'monthly',
    category: 'Utilities',
    isPaid: false,
    reminderDays: 5,
    description: 'Monthly internet service',
  },
];

export function RecurringPaymentReminder({
  payments = mockPayments,
}: RecurringPaymentReminderProps) {
  const [recurringPayments, setRecurringPayments] =
    useState<RecurringPayment[]>(payments);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatus = (payment: RecurringPayment) => {
    const daysUntilDue = getDaysUntilDue(payment.dueDate);

    if (payment.isPaid) {
      return { status: 'paid', message: 'Paid', color: 'green' };
    }

    if (daysUntilDue < 0) {
      return {
        status: 'overdue',
        message: `${Math.abs(daysUntilDue)} days overdue`,
        color: 'red',
      };
    }

    if (daysUntilDue <= payment.reminderDays) {
      return {
        status: 'due-soon',
        message: `Due in ${daysUntilDue} days`,
        color: 'orange',
      };
    }

    return {
      status: 'upcoming',
      message: `Due in ${daysUntilDue} days`,
      color: 'blue',
    };
  };

  const getUpcomingPayments = () => {
    return recurringPayments
      .filter(payment => !payment.isPaid)
      .sort((a, b) => getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate))
      .slice(0, 5);
  };

  const getOverduePayments = () => {
    return recurringPayments.filter(
      payment => !payment.isPaid && getDaysUntilDue(payment.dueDate) < 0
    );
  };

  const markAsPaid = (paymentId: string) => {
    setRecurringPayments(prev =>
      prev.map(payment =>
        payment.id === paymentId ? { ...payment, isPaid: true } : payment
      )
    );
    toast.success('Payment marked as paid');
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const upcomingPayments = getUpcomingPayments();
  const overduePayments = getOverduePayments();

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Recurring Payments
          </h2>
          <p className='text-muted-foreground'>
            Manage and track your recurring payment reminders
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className='h-4 w-4 mr-2' />
          Add Payment
        </Button>
      </div>

      {/* Overdue Alerts */}
      {overduePayments.length > 0 && (
        <Alert className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'>
          <AlertTriangle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-800 dark:text-red-200'>
            <strong>Overdue Payments:</strong> You have {overduePayments.length}{' '}
            payment(s) that are overdue.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Payments
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{recurringPayments.length}</div>
            <p className='text-xs text-muted-foreground'>
              {recurringPayments.filter(p => !p.isPaid).length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>This Month</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(
                recurringPayments
                  .filter(
                    p =>
                      !p.isPaid &&
                      new Date(p.dueDate).getMonth() === new Date().getMonth()
                  )
                  .reduce((sum, p) => sum + p.amount, 0)
              )}
            </div>
            <p className='text-xs text-muted-foreground'>Due this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Overdue</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {overduePayments.length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {overduePayments.length > 0 ? 'Need attention' : 'All up to date'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Due Soon</CardTitle>
            <Clock className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {
                upcomingPayments.filter(p => getDaysUntilDue(p.dueDate) <= 7)
                  .length
              }
            </div>
            <p className='text-xs text-muted-foreground'>Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Bell className='h-5 w-5' />
            <span>Upcoming Payments</span>
          </CardTitle>
          <CardDescription>Payments due in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {upcomingPayments.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-500' />
                <p>No upcoming payments in the next 30 days!</p>
              </div>
            ) : (
              upcomingPayments.map(payment => {
                const status = getPaymentStatus(payment);
                const daysUntilDue = getDaysUntilDue(payment.dueDate);

                return (
                  <div
                    key={payment.id}
                    className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='flex-shrink-0'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            status.color === 'red'
                              ? 'bg-red-500'
                              : status.color === 'orange'
                                ? 'bg-orange-500'
                                : status.color === 'green'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className='font-medium'>{payment.title}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {payment.category} • {payment.frequency}
                        </p>
                        {payment.description && (
                          <p className='text-xs text-muted-foreground mt-1'>
                            {payment.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='font-bold text-lg'>
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Badge
                          variant={
                            status.color === 'red'
                              ? 'destructive'
                              : status.color === 'orange'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {status.message}
                        </Badge>

                        {!payment.isPaid && (
                          <Button
                            size='sm'
                            onClick={() => markAsPaid(payment.id)}
                            className='ml-2'
                          >
                            Mark Paid
                          </Button>
                        )}

                        <Button variant='ghost' size='sm'>
                          <Edit className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Payments Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Recurring Payments</CardTitle>
          <CardDescription>
            Complete list of your recurring payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {recurringPayments.map(payment => {
              const status = getPaymentStatus(payment);

              return (
                <div
                  key={payment.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        payment.isPaid
                          ? 'bg-green-500'
                          : status.color === 'red'
                            ? 'bg-red-500'
                            : status.color === 'orange'
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <p className='font-medium'>{payment.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {payment.frequency} • {payment.category}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4'>
                    <p className='font-medium'>
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge variant={payment.isPaid ? 'default' : 'outline'}>
                      {payment.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
