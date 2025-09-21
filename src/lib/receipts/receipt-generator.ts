import crypto from 'crypto';

/**
 * Receipt Generator Service
 * Creates human-readable receipts and references for all transfers
 */

export interface ReceiptData {
  id: string;
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'refund';
  amount: number;
  currency: string;
  fromAccount?: string;
  toAccount?: string;
  description: string;
  reference: string;
  bankReference?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  fees?: number;
  exchangeRate?: number;
  recipientName?: string;
  recipientEmail?: string;
  notes?: string;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export class ReceiptGeneratorService {
  private static readonly RECEIPT_PREFIX = 'RCP';
  private static readonly REFERENCE_PREFIX = 'REF';

  /**
   * Generate human-readable reference
   */
  static generateReference(type: string, amount: number, timestamp: Date): string {
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '');
    const amountStr = Math.abs(amount).toString().padStart(6, '0');
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    
    return `${this.REFERENCE_PREFIX}-${type.toUpperCase()}-${dateStr}-${timeStr}-${amountStr}-${randomStr}`;
  }

  /**
   * Generate receipt ID
   */
  static generateReceiptId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${this.RECEIPT_PREFIX}-${timestamp}-${random}`;
  }

  /**
   * Generate human-readable receipt
   */
  static generateReceipt(data: ReceiptData): string {
    const template = this.getReceiptTemplate(data.type);
    return this.fillReceiptTemplate(template, data);
  }

  /**
   * Generate bank reconciliation reference
   */
  static generateBankReference(
    bankCode: string,
    accountNumber: string,
    amount: number,
    timestamp: Date
  ): string {
    const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
    const amountStr = Math.abs(amount).toString().padStart(8, '0');
    const accountStr = accountNumber.slice(-4);
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    
    return `${bankCode}-${dateStr}-${amountStr}-${accountStr}-${randomStr}`;
  }

  /**
   * Generate QR code data for receipt
   */
  static generateQRCodeData(receiptData: ReceiptData): string {
    const qrData = {
      id: receiptData.id,
      reference: receiptData.reference,
      amount: receiptData.amount,
      currency: receiptData.currency,
      timestamp: receiptData.timestamp.toISOString(),
      type: receiptData.type,
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate receipt for different transaction types
   */
  static generateTransferReceipt(data: ReceiptData): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                    TRANSFER RECEIPT                         ║
╠══════════════════════════════════════════════════════════════╣
║ Receipt ID: ${data.id.padEnd(47)} ║
║ Reference:  ${data.reference.padEnd(47)} ║
║ Date:       ${data.timestamp.toLocaleString().padEnd(47)} ║
║ Status:     ${data.status.toUpperCase().padEnd(47)} ║
╠══════════════════════════════════════════════════════════════╣
║ FROM:       ${(data.fromAccount || 'N/A').padEnd(47)} ║
║ TO:         ${(data.toAccount || 'N/A').padEnd(47)} ║
║ Amount:     ${data.currency} ${Math.abs(data.amount).toLocaleString().padEnd(42)} ║
║ Description: ${data.description.padEnd(45)} ║
╠══════════════════════════════════════════════════════════════╣
║ Bank Reference: ${(data.bankReference || 'N/A').padEnd(42)} ║
║ Fees:       ${data.fees ? `${data.currency} ${data.fees.toLocaleString()}` : 'N/A'}.padEnd(47)} ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  static generatePaymentReceipt(data: ReceiptData): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                    PAYMENT RECEIPT                          ║
╠══════════════════════════════════════════════════════════════╣
║ Receipt ID: ${data.id.padEnd(47)} ║
║ Reference:  ${data.reference.padEnd(47)} ║
║ Date:       ${data.timestamp.toLocaleString().padEnd(47)} ║
║ Status:     ${data.status.toUpperCase().padEnd(47)} ║
╠══════════════════════════════════════════════════════════════╣
║ Merchant:   ${(data.toAccount || 'N/A').padEnd(47)} ║
║ Amount:     ${data.currency} ${Math.abs(data.amount).toLocaleString().padEnd(42)} ║
║ Description: ${data.description.padEnd(45)} ║
╠══════════════════════════════════════════════════════════════╣
║ Bank Reference: ${(data.bankReference || 'N/A').padEnd(42)} ║
║ Fees:       ${data.fees ? `${data.currency} ${data.fees.toLocaleString()}` : 'N/A'}.padEnd(47)} ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  static generateDepositReceipt(data: ReceiptData): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║                    DEPOSIT RECEIPT                          ║
╠══════════════════════════════════════════════════════════════╣
║ Receipt ID: ${data.id.padEnd(47)} ║
║ Reference:  ${data.reference.padEnd(47)} ║
║ Date:       ${data.timestamp.toLocaleString().padEnd(47)} ║
║ Status:     ${data.status.toUpperCase().padEnd(47)} ║
╠══════════════════════════════════════════════════════════════╣
║ Account:    ${(data.toAccount || 'N/A').padEnd(47)} ║
║ Amount:     ${data.currency} ${Math.abs(data.amount).toLocaleString().padEnd(42)} ║
║ Description: ${data.description.padEnd(45)} ║
╠══════════════════════════════════════════════════════════════╣
║ Bank Reference: ${(data.bankReference || 'N/A').padEnd(42)} ║
║ Fees:       ${data.fees ? `${data.currency} ${data.fees.toLocaleString()}` : 'N/A'}.padEnd(47)} ║
╚══════════════════════════════════════════════════════════════╝
    `.trim();
  }

  /**
   * Generate email receipt
   */
  static generateEmailReceipt(data: ReceiptData): string {
    const receiptType = data.type.charAt(0).toUpperCase() + data.type.slice(1);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #ddd;">
          <h2 style="margin: 0; color: #333;">${receiptType} Receipt</h2>
          <p style="margin: 5px 0 0 0; color: #666;">AI Finance Tracker</p>
        </div>
        
        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
              <strong>Receipt ID:</strong><br>
              <span style="font-family: monospace; color: #666;">${data.id}</span>
            </div>
            <div>
              <strong>Reference:</strong><br>
              <span style="font-family: monospace; color: #666;">${data.reference}</span>
            </div>
            <div>
              <strong>Date:</strong><br>
              <span style="color: #666;">${data.timestamp.toLocaleString()}</span>
            </div>
            <div>
              <strong>Status:</strong><br>
              <span style="color: ${data.status === 'completed' ? '#22c55e' : data.status === 'failed' ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
                ${data.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span><strong>Amount:</strong></span>
              <span style="font-size: 24px; font-weight: bold; color: #333;">
                ${data.currency} ${Math.abs(data.amount).toLocaleString()}
              </span>
            </div>
            <div style="color: #666;">
              <strong>Description:</strong> ${data.description}
            </div>
            ${data.fromAccount ? `
              <div style="color: #666; margin-top: 5px;">
                <strong>From:</strong> ${data.fromAccount}
              </div>
            ` : ''}
            ${data.toAccount ? `
              <div style="color: #666; margin-top: 5px;">
                <strong>To:</strong> ${data.toAccount}
              </div>
            ` : ''}
          </div>

          ${data.bankReference ? `
            <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
              <div style="color: #666;">
                <strong>Bank Reference:</strong> ${data.bankReference}
              </div>
            </div>
          ` : ''}

          ${data.fees ? `
            <div style="color: #666; margin-top: 10px;">
              <strong>Fees:</strong> ${data.currency} ${data.fees.toLocaleString()}
            </div>
          ` : ''}

          ${data.notes ? `
            <div style="background: #f0f9ff; padding: 10px; border-radius: 4px; margin-top: 15px;">
              <strong>Notes:</strong> ${data.notes}
            </div>
          ` : ''}
        </div>

        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated receipt from AI Finance Tracker.<br>
            Please keep this receipt for your records.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generate PDF receipt
   */
  static generatePDFReceipt(data: ReceiptData): string {
    // In a real implementation, this would generate a PDF
    // For now, return HTML that can be converted to PDF
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ddd; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .amount { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>${data.type.toUpperCase()} RECEIPT</h2>
            <p>AI Finance Tracker</p>
          </div>
          <div class="content">
            <div class="row">
              <span>Receipt ID:</span>
              <span>${data.id}</span>
            </div>
            <div class="row">
              <span>Reference:</span>
              <span>${data.reference}</span>
            </div>
            <div class="row">
              <span>Date:</span>
              <span>${data.timestamp.toLocaleString()}</span>
            </div>
            <div class="row">
              <span>Status:</span>
              <span>${data.status.toUpperCase()}</span>
            </div>
            <div class="amount">
              ${data.currency} ${Math.abs(data.amount).toLocaleString()}
            </div>
            <div class="row">
              <span>Description:</span>
              <span>${data.description}</span>
            </div>
            ${data.fromAccount ? `
              <div class="row">
                <span>From:</span>
                <span>${data.fromAccount}</span>
              </div>
            ` : ''}
            ${data.toAccount ? `
              <div class="row">
                <span>To:</span>
                <span>${data.toAccount}</span>
              </div>
            ` : ''}
            ${data.bankReference ? `
              <div class="row">
                <span>Bank Ref:</span>
                <span>${data.bankReference}</span>
              </div>
            ` : ''}
            ${data.fees ? `
              <div class="row">
                <span>Fees:</span>
                <span>${data.currency} ${data.fees.toLocaleString()}</span>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Keep this receipt for your records</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate receipt template based on type
   */
  private static getReceiptTemplate(type: string): ReceiptTemplate {
    const templates: Record<string, ReceiptTemplate> = {
      transfer: {
        id: 'transfer',
        name: 'Transfer Receipt',
        template: 'transfer_template',
        variables: ['id', 'reference', 'amount', 'currency', 'fromAccount', 'toAccount', 'description', 'timestamp', 'status']
      },
      payment: {
        id: 'payment',
        name: 'Payment Receipt',
        template: 'payment_template',
        variables: ['id', 'reference', 'amount', 'currency', 'toAccount', 'description', 'timestamp', 'status']
      },
      deposit: {
        id: 'deposit',
        name: 'Deposit Receipt',
        template: 'deposit_template',
        variables: ['id', 'reference', 'amount', 'currency', 'toAccount', 'description', 'timestamp', 'status']
      },
      withdrawal: {
        id: 'withdrawal',
        name: 'Withdrawal Receipt',
        template: 'withdrawal_template',
        variables: ['id', 'reference', 'amount', 'currency', 'fromAccount', 'description', 'timestamp', 'status']
      },
      refund: {
        id: 'refund',
        name: 'Refund Receipt',
        template: 'refund_template',
        variables: ['id', 'reference', 'amount', 'currency', 'toAccount', 'description', 'timestamp', 'status']
      }
    };

    return templates[type] || templates.transfer;
  }

  /**
   * Fill receipt template with data
   */
  private static fillReceiptTemplate(template: ReceiptTemplate, data: ReceiptData): string {
    // In a real implementation, this would use a templating engine
    // For now, return a simple formatted string
    return `
Receipt ID: ${data.id}
Reference: ${data.reference}
Date: ${data.timestamp.toLocaleString()}
Status: ${data.status.toUpperCase()}
Amount: ${data.currency} ${Math.abs(data.amount).toLocaleString()}
Description: ${data.description}
${data.fromAccount ? `From: ${data.fromAccount}` : ''}
${data.toAccount ? `To: ${data.toAccount}` : ''}
${data.bankReference ? `Bank Reference: ${data.bankReference}` : ''}
${data.fees ? `Fees: ${data.currency} ${data.fees.toLocaleString()}` : ''}
    `.trim();
  }

  /**
   * Validate receipt data
   */
  static validateReceiptData(data: ReceiptData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.id) errors.push('Receipt ID is required');
    if (!data.reference) errors.push('Reference is required');
    if (!data.amount || data.amount === 0) errors.push('Amount is required');
    if (!data.currency) errors.push('Currency is required');
    if (!data.description) errors.push('Description is required');
    if (!data.timestamp) errors.push('Timestamp is required');
    if (!data.status) errors.push('Status is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate receipt summary for reconciliation
   */
  static generateReconciliationSummary(receipts: ReceiptData[]): string {
    const totalAmount = receipts.reduce((sum, receipt) => sum + Math.abs(receipt.amount), 0);
    const completedCount = receipts.filter(r => r.status === 'completed').length;
    const pendingCount = receipts.filter(r => r.status === 'pending').length;
    const failedCount = receipts.filter(r => r.status === 'failed').length;

    return `
Reconciliation Summary
=====================
Total Receipts: ${receipts.length}
Total Amount: ${receipts[0]?.currency || 'USD'} ${totalAmount.toLocaleString()}
Completed: ${completedCount}
Pending: ${pendingCount}
Failed: ${failedCount}

Receipts:
${receipts.map(r => `- ${r.id}: ${r.currency} ${Math.abs(r.amount).toLocaleString()} (${r.status})`).join('\n')}
    `.trim();
  }
}
