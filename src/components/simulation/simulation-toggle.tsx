'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RefreshCw, Eye, EyeOff, Zap } from 'lucide-react';
import { useSimulation } from '@/lib/simulation/simulation-context';

export function SimulationToggle() {
  const { isSimulationMode, toggleSimulationMode, refreshData } =
    useSimulation();

  return (
    <div className='flex items-center space-x-2'>
      {isSimulationMode && (
        <Badge
          variant='outline'
          className='bg-yellow-50 text-yellow-700 border-yellow-200'
        >
          <Zap className='h-3 w-3 mr-1' />
          SIMULATION
        </Badge>
      )}

      <Button
        onClick={toggleSimulationMode}
        variant={isSimulationMode ? 'default' : 'outline'}
        size='sm'
        className='flex items-center space-x-2'
      >
        {isSimulationMode ? (
          <>
            <EyeOff className='h-4 w-4' />
            <span>Exit Simulation</span>
          </>
        ) : (
          <>
            <Play className='h-4 w-4' />
            <span>Start Simulation</span>
          </>
        )}
      </Button>

      {isSimulationMode && (
        <Button
          onClick={refreshData}
          variant='outline'
          size='sm'
          className='flex items-center space-x-2'
        >
          <RefreshCw className='h-4 w-4' />
          <span>Refresh Data</span>
        </Button>
      )}
    </div>
  );
}
