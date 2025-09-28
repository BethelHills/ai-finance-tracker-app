import { Transaction } from '@prisma/client';
import { AIService } from '@/lib/ai-service';

/**
 * Export Service
 * Handles CSV, PDF, and AI-generated report exports
 */

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'ai-summary';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCategories?: boolean;
  includeReconciliation?: boolean;
  includeCharts?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Buffer;
  filename: string;
  mimeType: string;
  error?: string;
}

export class ExportService {
  /**
   * Export transactions to CSV
   */
  static async exportToCSV(
    transactions: Transaction[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const headers = [
        'Date',
        'Description',
        'Amount',
        'Type',
        'Category',
        'Account',
        'Reference',
        'Status',
        'Reconciliation Status',
        'Notes',
      ];

      const csvRows = [
        headers.join(','),
        ...transactions.map(tx =>
          [
            new Date(tx.date).toISOString().split('T')[0],
            `"${tx.description.replace(/"/g, '""')}"`,
            tx.amount.toString(),
            tx.type,
            tx.categoryId || '',
            tx.accountId || '',
            '', // reference not available
            '', // status not available
            '', // reconciliationStatus not available
            '', // notes not available
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const filename = `transactions_${this.formatDate(options.dateRange.start)}_to_${this.formatDate(options.dateRange.end)}.csv`;

      return {
        success: true,
        data: csvContent,
        filename,
        mimeType: 'text/csv',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export transactions to PDF
   */
  static async exportToPDF(
    transactions: Transaction[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // In a real implementation, you would use a PDF library like jsPDF or PDFKit
      // For now, we'll create a simple HTML-based PDF
      const htmlContent = this.generatePDFHTML(transactions, options);

      const filename = `transactions_${this.formatDate(options.dateRange.start)}_to_${this.formatDate(options.dateRange.end)}.pdf`;

      return {
        success: true,
        data: htmlContent,
        filename,
        mimeType: 'application/pdf',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate AI-powered monthly summary
   */
  static async generateAISummary(
    transactions: Transaction[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Generate AI summary using the AI service
      const summary = await AIService.analyzeSpendingPatterns(
        transactions.map(tx => ({
          amount: Number(tx.amount),
          description: tx.description,
          category: tx.categoryId || 'Unknown',
          date: tx.date.toISOString(),
        }))
      );

      const filename = `monthly_summary_${this.formatDate(options.dateRange.start)}_to_${this.formatDate(options.dateRange.end)}.md`;

      return {
        success: true,
        data: JSON.stringify(summary, null, 2),
        filename,
        mimeType: 'text/markdown',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Export financial report with charts
   */
  static async exportFinancialReport(
    transactions: Transaction[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const report = await this.generateFinancialReport(transactions, options);

      const filename = `financial_report_${this.formatDate(options.dateRange.start)}_to_${this.formatDate(options.dateRange.end)}.html`;

      return {
        success: true,
        data: report,
        filename,
        mimeType: 'text/html',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate PDF HTML content
   */
  private static generatePDFHTML(
    transactions: Transaction[],
    options: ExportOptions
  ): string {
    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalExpenses = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    const netAmount = totalIncome - totalExpenses;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
          .summary h3 { margin-top: 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .summary-label { color: #666; }
          .income { color: #22c55e; }
          .expense { color: #ef4444; }
          .net { color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          .positive { color: #22c55e; }
          .negative { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Transaction Report</h1>
          <p>Period: ${this.formatDate(options.dateRange.start)} to ${this.formatDate(options.dateRange.end)}</p>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value income">$${totalIncome.toLocaleString()}</div>
              <div class="summary-label">Total Income</div>
            </div>
            <div class="summary-item">
              <div class="summary-value expense">$${totalExpenses.toLocaleString()}</div>
              <div class="summary-label">Total Expenses</div>
            </div>
            <div class="summary-item">
              <div class="summary-value net">$${netAmount.toLocaleString()}</div>
              <div class="summary-label">Net Amount</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                tx => `
              <tr>
                <td>${tx.date.toISOString().split('T')[0]}</td>
                <td>${tx.description}</td>
                <td class="amount ${Number(tx.amount) >= 0 ? 'positive' : 'negative'}">
                  $${Math.abs(Number(tx.amount)).toLocaleString()}
                </td>
                <td>${tx.type}</td>
                <td>${tx.categoryId || 'N/A'}</td>
                <td>N/A</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Generate financial report HTML
   */
  private static async generateFinancialReport(
    transactions: Transaction[],
    options: ExportOptions
  ): Promise<string> {
    const stats = this.calculateTransactionStats(transactions);
    const categoryBreakdown = this.calculateCategoryBreakdown(transactions);
    const monthlyTrends = this.calculateMonthlyTrends(
      transactions,
      options.dateRange
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .stat-label { color: #666; font-size: 14px; }
          .chart-container { margin: 30px 0; }
          .category-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .category-item { display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 4px; }
          .income { color: #22c55e; }
          .expense { color: #ef4444; }
          .net { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <p>Period: ${this.formatDate(options.dateRange.start)} to ${this.formatDate(options.dateRange.end)}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value income">$${stats.totalIncome.toLocaleString()}</div>
            <div class="stat-label">Total Income</div>
          </div>
          <div class="stat-card">
            <div class="stat-value expense">$${stats.totalExpenses.toLocaleString()}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
          <div class="stat-card">
            <div class="stat-value net">$${stats.netAmount.toLocaleString()}</div>
            <div class="stat-label">Net Amount</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.transactionCount}</div>
            <div class="stat-label">Transactions</div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Monthly Trends</h3>
          <canvas id="monthlyChart" width="400" height="200"></canvas>
        </div>

        <div class="chart-container">
          <h3>Category Breakdown</h3>
          <canvas id="categoryChart" width="400" height="200"></canvas>
        </div>

        <div class="category-list">
          <h3>Top Categories</h3>
          ${categoryBreakdown
            .map(
              cat => `
            <div class="category-item">
              <span>${cat.category}</span>
              <span>$${cat.amount.toLocaleString()}</span>
            </div>
          `
            )
            .join('')}
        </div>

        <script>
          // Monthly trends chart
          const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
          new Chart(monthlyCtx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(monthlyTrends.map(t => t.month))},
              datasets: [{
                label: 'Income',
                data: ${JSON.stringify(monthlyTrends.map(t => t.income))},
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }, {
                label: 'Expenses',
                data: ${JSON.stringify(monthlyTrends.map(t => t.expenses))},
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });

          // Category breakdown chart
          const categoryCtx = document.getElementById('categoryChart').getContext('2d');
          new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
              labels: ${JSON.stringify(categoryBreakdown.map(c => c.category))},
              datasets: [{
                data: ${JSON.stringify(categoryBreakdown.map(c => c.amount))},
                backgroundColor: [
                  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
                  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
                ]
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Calculate transaction statistics
   */
  private static calculateTransactionStats(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const totalExpenses = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  }

  /**
   * Calculate category breakdown
   */
  private static calculateCategoryBreakdown(transactions: Transaction[]) {
    const categoryMap = new Map<string, number>();

    transactions.forEach(tx => {
      if (tx.categoryId) {
        const current = categoryMap.get(tx.categoryId) || 0;
        categoryMap.set(tx.categoryId, current + Math.abs(Number(tx.amount)));
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  /**
   * Calculate monthly trends
   */
  private static calculateMonthlyTrends(
    transactions: Transaction[],
    dateRange: { start: Date; end: Date }
  ) {
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(tx => {
      const month = tx.date.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { income: 0, expenses: 0 });
      }

      const data = monthlyData.get(month)!;
      if (tx.type === 'INCOME') {
        data.income += Number(tx.amount);
      } else if (tx.type === 'EXPENSE') {
        data.expenses += Math.abs(Number(tx.amount));
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Format date for filename
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
