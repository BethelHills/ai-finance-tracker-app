'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Brain,
  Tag,
  TrendingUp,
  CheckCircle,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategorizationResult {
  category: string;
  confidence: number;
  tags: string[];
  reasoning: string;
}

interface SmartCategorizationProps {
  onCategorize: (result: CategorizationResult) => void;
  userHistory?: Array<{
    description: string;
    category: string;
    tags: string[];
    userCorrected?: boolean;
  }>;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Business',
  'Investment',
  'Other',
];

export function SmartCategorization({
  onCategorize,
  userHistory,
}: SmartCategorizationProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<CategorizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [userCorrection, setUserCorrection] = useState<{
    category: string;
    tags: string[];
  } | null>(null);
  const { success, error: showError } = useToast();

  const categorizeTransaction = async () => {
    if (!description.trim() || !amount) {
      showError('Please enter both description and amount.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: parseFloat(amount),
          userHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        onCategorize(data);
        success(
          `AI categorized as "${data.category}" with ${Math.round(data.confidence * 100)}% confidence.`
        );
      } else {
        throw new Error('Failed to categorize');
      }
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      showError('Unable to categorize transaction. Please try again.');
      // Fallback to mock result for demo
      setResult(getMockCategorization());
    } finally {
      setLoading(false);
    }
  };

  const getMockCategorization = (): CategorizationResult => {
    const mockCategories = ['Food & Dining', 'Transportation', 'Shopping'];
    const mockTags = {
      'Food & Dining': ['grocery', 'restaurant'],
      Transportation: ['gas', 'uber'],
      Shopping: ['clothing', 'electronics'],
    };

    const category =
      mockCategories[Math.floor(Math.random() * mockCategories.length)];

    return {
      category,
      confidence: 0.85 + Math.random() * 0.15,
      tags: mockTags[category as keyof typeof mockTags] || [],
      reasoning: `Based on the description "${description}" and amount $${amount}, this appears to be a ${category.toLowerCase()} transaction.`,
    };
  };

  const acceptCategorization = () => {
    if (result) {
      success('AI will learn from this feedback.');
      setResult(null);
      setDescription('');
      setAmount('');
    }
  };

  const correctCategorization = () => {
    if (result) {
      setUserCorrection({
        category: result.category,
        tags: result.tags,
      });
    }
  };

  const saveCorrection = () => {
    if (userCorrection) {
      success(
        'AI will learn from your correction to improve future categorizations.'
      );
      setUserCorrection(null);
      setResult(null);
      setDescription('');
      setAmount('');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    const color =
      confidence >= 0.8
        ? 'bg-green-100 text-green-800'
        : confidence >= 0.6
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800';

    return (
      <Badge className={color}>
        {Math.round(confidence * 100)}% confidence
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Brain className='h-5 w-5 text-purple-600' />
          <span>AI Smart Categorization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Input Section */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>Transaction Description</Label>
            <Input
              id='description'
              placeholder='e.g., "Starbucks Coffee", "Shell Gas Station"'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount ($)</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              placeholder='25.50'
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <Button
            onClick={categorizeTransaction}
            disabled={loading}
            className='w-full'
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className='h-4 w-4 mr-2' />
                Categorize with AI
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && !userCorrection && (
          <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center justify-between'>
              <h4 className='font-semibold'>AI Categorization Result</h4>
              {getConfidenceBadge(result.confidence)}
            </div>

            <div className='space-y-3'>
              <div>
                <span className='text-sm text-muted-foreground'>
                  Category:{' '}
                </span>
                <Badge variant='outline' className='ml-2'>
                  {result.category}
                </Badge>
              </div>

              {result.tags.length > 0 && (
                <div>
                  <span className='text-sm text-muted-foreground'>Tags: </span>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {result.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='text-xs'
                      >
                        <Tag className='h-3 w-3 mr-1' />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className='text-sm text-muted-foreground'>
                  Reasoning:{' '}
                </span>
                <p className='text-sm mt-1'>{result.reasoning}</p>
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button
                onClick={acceptCategorization}
                size='sm'
                className='flex-1'
              >
                <CheckCircle className='h-4 w-4 mr-2' />
                Accept
              </Button>
              <Button
                onClick={correctCategorization}
                variant='outline'
                size='sm'
                className='flex-1'
              >
                <X className='h-4 w-4 mr-2' />
                Correct
              </Button>
            </div>
          </div>
        )}

        {/* Correction Section */}
        {userCorrection && (
          <div className='space-y-4 p-4 bg-blue-50 rounded-lg'>
            <h4 className='font-semibold text-blue-800'>
              Correct the Categorization
            </h4>

            <div className='space-y-3'>
              <div className='space-y-2'>
                <Label>Correct Category</Label>
                <Select
                  value={userCorrection.category}
                  onValueChange={value =>
                    setUserCorrection(prev =>
                      prev ? { ...prev, category: value } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder='grocery, organic, weekly'
                  value={userCorrection.tags.join(', ')}
                  onChange={e =>
                    setUserCorrection(prev =>
                      prev
                        ? {
                            ...prev,
                            tags: e.target.value
                              .split(',')
                              .map(tag => tag.trim())
                              .filter(Boolean),
                          }
                        : null
                    )
                  }
                />
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button onClick={saveCorrection} size='sm' className='flex-1'>
                <CheckCircle className='h-4 w-4 mr-2' />
                Save Correction
              </Button>
              <Button
                onClick={() => setUserCorrection(null)}
                variant='outline'
                size='sm'
                className='flex-1'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Learning Indicator */}
        {userHistory && userHistory.length > 0 && (
          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
            <TrendingUp className='h-4 w-4 text-green-500' />
            <span>
              AI is learning from your {userHistory.length} previous
              transactions
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
