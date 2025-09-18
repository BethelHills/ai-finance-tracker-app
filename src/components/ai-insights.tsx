'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  AlertTriangle,
  Target,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: number;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  icon: any;
  color: string;
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card className='ai-glow'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Brain className='h-5 w-5 text-purple-500' />
            <CardTitle className='ai-gradient-text'>AI Insights</CardTitle>
            <Badge variant='outline' className='text-xs'>
              <Sparkles className='h-3 w-3 mr-1' />
              Powered by GPT-4
            </Badge>
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            size='sm'
            variant='outline'
          >
            {isGenerating ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className='h-4 w-4 mr-2' />
                Generate New
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          AI-powered analysis of your financial patterns and personalized
          recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {insights.map(insight => (
          <div
            key={insight.id}
            className={cn(
              'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
              selectedInsight?.id === insight.id
                ? 'ring-2 ring-primary'
                : 'hover:bg-accent/50'
            )}
            onClick={() =>
              setSelectedInsight(
                selectedInsight?.id === insight.id ? null : insight
              )
            }
          >
            <div className='flex items-start space-x-3'>
              <div className={cn('p-2 rounded-full', insight.color)}>
                <insight.icon className='h-4 w-4' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-medium'>{insight.title}</h4>
                  <Badge
                    variant='secondary'
                    className={cn('text-xs', priorityColors[insight.priority])}
                  >
                    {insight.priority}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground mt-1'>
                  {insight.description}
                </p>
                {selectedInsight?.id === insight.id && (
                  <div className='mt-3 p-3 bg-muted rounded-md'>
                    <div className='flex items-start space-x-2'>
                      <TrendingUp className='h-4 w-4 text-blue-500 mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-blue-700'>
                          AI Recommendation:
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                    <Button size='sm' className='mt-2'>
                      Apply Recommendation
                      <ArrowRight className='h-3 w-3 ml-1' />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* AI Analysis Summary */}
        <div className='mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border'>
          <div className='flex items-center space-x-2 mb-2'>
            <Sparkles className='h-4 w-4 text-purple-500' />
            <h4 className='text-sm font-medium'>AI Analysis Summary</h4>
          </div>
          <p className='text-sm text-muted-foreground'>
            Based on your spending patterns, you're doing well with your savings
            rate of 26.7%. The AI recommends focusing on optimizing your dining
            expenses and considering the grocery store switch to maximize your
            savings potential.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
