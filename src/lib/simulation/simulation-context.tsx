'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MockDataGenerator,
  MockUser,
  MockAccount,
  MockTransaction,
  MockRecipient,
} from './mock-data';

interface SimulationContextType {
  isSimulationMode: boolean;
  toggleSimulationMode: () => void;
  user: MockUser | null;
  accounts: MockAccount[];
  transactions: MockTransaction[];
  recipients: MockRecipient[];
  insights: any[];
  stats: any;
  refreshData: () => void;
  addTransaction: (transaction: Omit<MockTransaction, 'id'>) => void;
  updateAccountBalance: (accountId: string, newBalance: number) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(
  undefined
);

export function SimulationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSimulationMode, setIsSimulationMode] = useState(true); // Start in simulation mode
  const [user, setUser] = useState<MockUser | null>(null);
  const [accounts, setAccounts] = useState<MockAccount[]>([]);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [recipients, setRecipients] = useState<MockRecipient[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const generateMockData = () => {
    const data = MockDataGenerator.generateCompleteUserData();
    setUser(data.user);
    setAccounts(data.accounts);
    setTransactions(data.transactions);
    setRecipients(data.recipients);
    setInsights(data.insights);
    setStats(data.stats);
  };

  useEffect(() => {
    if (isSimulationMode) {
      generateMockData();
    }
  }, [isSimulationMode]);

  const toggleSimulationMode = () => {
    setIsSimulationMode(!isSimulationMode);
    if (!isSimulationMode) {
      generateMockData();
    }
  };

  const refreshData = () => {
    if (isSimulationMode) {
      generateMockData();
    }
  };

  const addTransaction = (transactionData: Omit<MockTransaction, 'id'>) => {
    const newTransaction: MockTransaction = {
      ...transactionData,
      id: `txn_${Math.random().toString(36).substr(2, 9)}`,
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance
    updateAccountBalance(
      transactionData.accountId,
      accounts.find(a => a.id === transactionData.accountId)?.balance ||
        0 + transactionData.amount
    );
  };

  const updateAccountBalance = (accountId: string, newBalance: number) => {
    setAccounts(prev =>
      prev.map(account =>
        account.id === accountId
          ? { ...account, balance: newBalance, lastUpdated: new Date() }
          : account
      )
    );
  };

  const value: SimulationContextType = {
    isSimulationMode,
    toggleSimulationMode,
    user,
    accounts,
    transactions,
    recipients,
    insights,
    stats,
    refreshData,
    addTransaction,
    updateAccountBalance,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// Simulation mode indicator component
export function SimulationModeIndicator() {
  const { isSimulationMode, toggleSimulationMode } = useSimulation();

  if (!isSimulationMode) return null;

  return (
    <div className='fixed top-4 right-4 z-50'>
      <div className='bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2'>
        <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
        <span className='text-sm font-medium'>SIMULATION MODE</span>
        <button
          onClick={toggleSimulationMode}
          className='ml-2 text-white hover:text-gray-200 text-xs underline'
        >
          Exit
        </button>
      </div>
    </div>
  );
}
