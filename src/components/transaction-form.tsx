'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { CreateTransactionData } from '@/types/transaction';
import { getTransactionCategories } from '@/lib/transaction-utils';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionData) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const categories = getTransactionCategories();

export function TransactionForm({
  onSubmit,
  onCancel,
  isOpen = false,
  onOpenChange,
}: TransactionFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: '',
      category: '',
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  const selectedType = watch('type');

  const handleFormSubmit = (data: TransactionFormData) => {
    try {
      onSubmit(data);
      success('Transaction added successfully!');
      reset();
      setIsExpanded(false);
      onOpenChange?.(false);
    } catch (err) {
      error('Failed to add transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    reset();
    setIsExpanded(false);
    onCancel?.();
    onOpenChange?.(false);
  };

  if (!isExpanded && !isOpen) {
    return (
      <Button onClick={() => setIsExpanded(true)} className='w-full' size='lg'>
        <Plus className='h-4 w-4 mr-2' />
        Add Transaction
      </Button>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>
              Record your income or expense with details
            </CardDescription>
          </div>
          <Button variant='ghost' size='sm' onClick={handleCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          {/* Amount and Type */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount *</Label>
              <Input
                id='amount'
                type='number'
                step='0.01'
                placeholder='0.00'
                {...register('amount', { valueAsNumber: true })}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className='text-sm text-red-500'>{errors.amount.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Type *</Label>
              <Select
                onValueChange={value =>
                  setValue('type', value as 'INCOME' | 'EXPENSE')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='EXPENSE'>Expense</SelectItem>
                  <SelectItem value='INCOME'>Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-sm text-red-500'>{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description *</Label>
            <Input
              id='description'
              placeholder='e.g., Grocery shopping at Whole Foods'
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className='space-y-2'>
            <Label htmlFor='category'>Category *</Label>
            <Select onValueChange={value => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className='text-sm text-red-500'>{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <Label htmlFor='date'>Date *</Label>
            <Input
              id='date'
              type='date'
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className='text-sm text-red-500'>{errors.date.message}</p>
            )}
          </div>

          {/* Note */}
          <div className='space-y-2'>
            <Label htmlFor='note'>Note (Optional)</Label>
            <Input
              id='note'
              placeholder='Additional notes...'
              {...register('note')}
            />
          </div>

          {/* Type-specific styling */}
          {selectedType && (
            <div
              className={`p-3 rounded-lg border ${
                selectedType === 'INCOME'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  selectedType === 'INCOME' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {selectedType === 'INCOME'
                  ? '💰 This will be added to your income'
                  : '💸 This will be deducted from your balance'}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
