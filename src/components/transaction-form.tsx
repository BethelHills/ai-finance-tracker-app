'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// AI-Generated Form Schema
const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: z.string().min(1, 'Category is required'),
  account: z.string().min(1, 'Account is required'),
  date: z.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
})

type TransactionFormData = z.infer<typeof transactionSchema>

// AI-Generated Categories
const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: 'bg-blue-100 text-blue-800' },
  { id: 'housing', name: 'Housing', icon: '🏠', color: 'bg-green-100 text-green-800' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-100 text-purple-800' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: 'bg-red-100 text-red-800' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-800' },
  { id: 'education', name: 'Education', icon: '📚', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'salary', name: 'Salary', icon: '💰', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'freelance', name: 'Freelance', icon: '💼', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'bg-amber-100 text-amber-800' },
  { id: 'other', name: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-800' }
]

const accounts = [
  { id: 'checking', name: 'Chase Checking', type: 'CHECKING' },
  { id: 'savings', name: 'Chase Savings', type: 'SAVINGS' },
  { id: 'credit', name: 'Chase Credit Card', type: 'CREDIT_CARD' },
  { id: 'investment', name: 'Fidelity Investment', type: 'INVESTMENT' }
]

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void
  onCancel?: () => void
  initialData?: Partial<TransactionFormData>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransactionForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isOpen = false, 
  onOpenChange 
}: TransactionFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      type: initialData?.type || 'EXPENSE',
      category: initialData?.category || '',
      account: initialData?.account || '',
      date: initialData?.date || new Date(),
      notes: initialData?.notes || '',
      tags: initialData?.tags || []
    }
  })

  const selectedType = watch('type')
  const selectedCategory = watch('category')

  const filteredCategories = categories.filter(cat => {
    if (selectedType === 'INCOME') {
      return ['salary', 'freelance', 'investment'].includes(cat.id)
    }
    return !['salary', 'freelance', 'investment'].includes(cat.id)
  })

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({ ...data, tags: selectedTags })
    reset()
    setSelectedTags([])
    onOpenChange?.(false)
  }

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record your income or expense with AI-powered categorization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Amount and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping at Whole Foods"
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Category and Account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select onValueChange={(value) => setValue('account', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account && (
                <p className="text-sm text-red-500">{errors.account.message}</p>
              )}
            </div>
          </div>

          {/* Selected Category Display */}
          {selectedCategoryData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={selectedCategoryData.color}>
                    {selectedCategoryData.icon} {selectedCategoryData.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    AI will use this for categorization
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { valueAsDate: true })}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes (optional)"
              {...register('notes')}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* AI Suggestion */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">AI Suggestion</p>
                  <p className="text-sm text-blue-700">
                    Based on your description, AI will automatically categorize this transaction 
                    and provide insights about your spending patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
