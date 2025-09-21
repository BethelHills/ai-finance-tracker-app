import { initializeWorkers } from './queue';

// Initialize all background workers
export function startWorkers() {
  try {
    initializeWorkers();
    console.log('✅ All background workers started successfully');
  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    throw error;
  }
}

// Graceful shutdown
export function stopWorkers() {
  console.log('🛑 Stopping background workers...');
  // Workers will be stopped when the process exits
}
