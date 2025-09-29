import { createClient } from '@/lib/supabase/client';
import { EncryptionService } from './encryption';

export interface CloudData {
  id: string;
  user_id: string;
  data_type: 'transactions' | 'budgets' | 'goals' | 'accounts' | 'settings';
  data: any;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
}

export class CloudSyncService {
  private static supabase = createClient();

  private static getEncryptedData(
    data: any,
    userId: string,
    dataType: string
  ): any {
    // Define which fields need encryption based on data type
    const encryptionFields: Record<string, string[]> = {
      transactions: ['description', 'notes'],
      accounts: ['account_number', 'routing_number', 'notes'],
      budgets: ['notes'],
      goals: ['notes', 'description'],
      settings: ['api_keys', 'tokens'],
    };

    const fieldsToEncrypt = encryptionFields[dataType] || [];

    if (fieldsToEncrypt.length === 0) {
      return data;
    }

    return EncryptionService.encryptSensitiveFields(
      data,
      userId,
      fieldsToEncrypt
    );
  }

  private static getDecryptedData(
    data: any,
    userId: string,
    dataType: string
  ): any {
    const encryptionFields: Record<string, string[]> = {
      transactions: ['description', 'notes'],
      accounts: ['account_number', 'routing_number', 'notes'],
      budgets: ['notes'],
      goals: ['notes', 'description'],
      settings: ['api_keys', 'tokens'],
    };

    const fieldsToDecrypt = encryptionFields[dataType] || [];

    if (fieldsToDecrypt.length === 0) {
      return data;
    }

    return EncryptionService.decryptSensitiveFields(
      data,
      userId,
      fieldsToDecrypt
    );
  }

  static async saveData(
    dataType: CloudData['data_type'],
    data: any,
    userId: string,
    recordId?: string
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      const encryptedData = this.getEncryptedData(data, userId, dataType);
      const id = recordId || EncryptionService.generateSecureId();

      const { error } = await this.supabase.from('user_data').upsert({
        id,
        user_id: userId,
        data_type: dataType,
        data: encryptedData,
        encrypted: true,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving data to cloud:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id };
    } catch (error) {
      console.error('Cloud sync error:', error);
      return { success: false, error: 'Failed to sync data to cloud' };
    }
  }

  static async loadData(
    dataType: CloudData['data_type'],
    userId: string,
    recordId?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let query = this.supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType);

      if (recordId) {
        query = query.eq('id', recordId);
      }

      const { data, error } = await query.order('updated_at', {
        ascending: false,
      });

      if (error) {
        console.error('Error loading data from cloud:', error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: true, data: recordId ? null : [] };
      }

      // Decrypt the data
      const decryptedData = recordId
        ? this.getDecryptedData(data[0].data, userId, dataType)
        : data.map(record =>
            this.getDecryptedData(record.data, userId, dataType)
          );

      return { success: true, data: decryptedData };
    } catch (error) {
      console.error('Cloud sync error:', error);
      return { success: false, error: 'Failed to load data from cloud' };
    }
  }

  static async deleteData(
    dataType: CloudData['data_type'],
    userId: string,
    recordId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('user_data')
        .delete()
        .eq('id', recordId)
        .eq('user_id', userId)
        .eq('data_type', dataType);

      if (error) {
        console.error('Error deleting data from cloud:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Cloud sync error:', error);
      return { success: false, error: 'Failed to delete data from cloud' };
    }
  }

  static async syncAllUserData(userId: string): Promise<{
    success: boolean;
    data?: Record<string, any>;
    error?: string;
  }> {
    try {
      const dataTypes: CloudData['data_type'][] = [
        'transactions',
        'budgets',
        'goals',
        'accounts',
        'settings',
      ];

      const allData: Record<string, any> = {};

      for (const dataType of dataTypes) {
        const result = await this.loadData(dataType, userId);
        if (result.success) {
          allData[dataType] = result.data || [];
        } else {
          console.error(`Failed to load ${dataType}:`, result.error);
          allData[dataType] = [];
        }
      }

      return { success: true, data: allData };
    } catch (error) {
      console.error('Error syncing all user data:', error);
      return { success: false, error: 'Failed to sync user data' };
    }
  }

  static async getDataStats(userId: string): Promise<{
    success: boolean;
    stats?: Record<string, number>;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_data')
        .select('data_type')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting data stats:', error);
        return { success: false, error: error.message };
      }

      const stats: Record<string, number> = {};
      data?.forEach(record => {
        stats[record.data_type] = (stats[record.data_type] || 0) + 1;
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return { success: false, error: 'Failed to get data statistics' };
    }
  }
}
