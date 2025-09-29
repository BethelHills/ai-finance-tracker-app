import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export interface ExportData {
  transactions: Array<{
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
    account: string;
  }>;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    period: string;
  };
}

export class ExportService {
  static async exportToCSV(data: ExportData): Promise<void> {
    const headers = [
      'Date',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Account',
    ];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map(tx =>
        [
          tx.date,
          `"${tx.description.replace(/"/g, '""')}"`,
          tx.category,
          tx.type,
          tx.amount,
          tx.account,
        ].join(',')
      ),
      '',
      'Summary',
      `Total Income,${data.summary.totalIncome}`,
      `Total Expenses,${data.summary.totalExpenses}`,
      `Net Amount,${data.summary.netAmount}`,
      `Period,${data.summary.period}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `transactions-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  static async exportToPDF(
    data: ExportData,
    chartElement?: HTMLElement
  ): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Report', margin, 30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 40);
    doc.text(`Period: ${data.summary.period}`, margin, 50);

    // Summary Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin, 70);

    const summaryData = [
      ['Total Income', `$${data.summary.totalIncome.toLocaleString()}`],
      ['Total Expenses', `$${data.summary.totalExpenses.toLocaleString()}`],
      ['Net Amount', `$${data.summary.netAmount.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 80,
      head: [['Category', 'Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 120;

    // Chart Section (if provided)
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if needed
        if (finalY + imgHeight > 250) {
          doc.addPage();
          finalY = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Expense Breakdown Chart', margin, finalY);

        doc.addImage(imgData, 'PNG', margin, finalY + 10, imgWidth, imgHeight);
        finalY += imgHeight + 20;
      } catch (error) {
        console.error('Error adding chart to PDF:', error);
      }
    }

    // Transactions Table
    const transactionsData = data.transactions.map(tx => [
      tx.date,
      tx.description.length > 30
        ? tx.description.substring(0, 30) + '...'
        : tx.description,
      tx.category,
      tx.type,
      `$${tx.amount.toLocaleString()}`,
      tx.account,
    ]);

    // Add new page if needed
    if (finalY > 150) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', margin, finalY);

    autoTable(doc, {
      startY: finalY + 10,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount', 'Account']],
      body: transactionsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 40 }, // Description
        4: { halign: 'right' }, // Amount
      },
      margin: { left: margin, right: margin },
      pageBreak: 'auto',
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  static async exportChartsToPDF(
    chartElements: HTMLElement[],
    title: string = 'Charts Report'
  ): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 30);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 40);

    let currentY = 60;

    for (let i = 0; i < chartElements.length; i++) {
      const element = chartElements[i];

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if needed
        if (currentY + imgHeight > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;

        // Add new page after each chart except the last one
        if (i < chartElements.length - 1) {
          doc.addPage();
          currentY = 20;
        }
      } catch (error) {
        console.error(`Error adding chart ${i + 1} to PDF:`, error);
      }
    }

    doc.save(`charts-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
