import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Generate an executive summary PDF
 * @param {Array} data - The CSF data
 * @param {Array} users - The users array
 */
export function generateExecutiveSummaryPDF(data, users) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString();

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CSF Profile Assessment', pageWidth / 2, 20, { align: 'center' });
  doc.text('Executive Summary', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${today}`, pageWidth / 2, 38, { align: 'center' });

  // Summary statistics
  const inScopeItems = data.filter(item => item['In Scope? '] === 'Yes');
  const totalInScope = inScopeItems.length;

  const statusCounts = inScopeItems.reduce((acc, item) => {
    const status = item['Testing Status'] || 'Not Started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const avgCurrentScore = inScopeItems.length > 0
    ? (inScopeItems.reduce((sum, item) => sum + (item['Current State Score'] || 0), 0) / inScopeItems.length).toFixed(1)
    : 0;

  const avgDesiredScore = inScopeItems.length > 0
    ? (inScopeItems.reduce((sum, item) => sum + (item['Desired State Score'] || 0), 0) / inScopeItems.length).toFixed(1)
    : 0;

  // Overview section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Overview', 14, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const overviewData = [
    ['Total Controls', data.length.toString()],
    ['In Scope Controls', totalInScope.toString()],
    ['Average Current Score', avgCurrentScore.toString()],
    ['Average Desired Score', avgDesiredScore.toString()],
    ['Score Gap', (avgDesiredScore - avgCurrentScore).toFixed(1)],
  ];

  doc.autoTable({
    startY: 60,
    head: [['Metric', 'Value']],
    body: overviewData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Status breakdown
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Testing Status Breakdown', 14, doc.lastAutoTable.finalY + 15);

  const statusData = Object.entries(statusCounts).map(([status, count]) => [
    status,
    count.toString(),
    totalInScope > 0 ? `${((count / totalInScope) * 100).toFixed(1)}%` : '0%',
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Status', 'Count', 'Percentage']],
    body: statusData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Function breakdown
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Score by Function', 14, doc.lastAutoTable.finalY + 15);

  const functionGroups = inScopeItems.reduce((acc, item) => {
    const func = item.Function || 'Unknown';
    if (!acc[func]) {
      acc[func] = { total: 0, current: 0, desired: 0 };
    }
    acc[func].total++;
    acc[func].current += item['Current State Score'] || 0;
    acc[func].desired += item['Desired State Score'] || 0;
    return acc;
  }, {});

  const functionData = Object.entries(functionGroups).map(([func, stats]) => [
    func,
    stats.total.toString(),
    (stats.current / stats.total).toFixed(1),
    (stats.desired / stats.total).toFixed(1),
    ((stats.desired - stats.current) / stats.total).toFixed(1),
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Function', 'Controls', 'Avg Current', 'Avg Desired', 'Avg Gap']],
    body: functionData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  // Save
  doc.save(`CSF_Executive_Summary_${today.replace(/\//g, '-')}.pdf`);
  toast.success('Executive summary PDF generated');
}

/**
 * Generate a remediation priority list PDF
 * @param {Array} data - The CSF data
 * @param {Array} users - The users array
 */
export function generateRemediationPriorityPDF(data, users) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString();

  // Filter and sort by gap (largest gap first)
  const priorityItems = data
    .filter(item => item['In Scope? '] === 'Yes')
    .map(item => ({
      ...item,
      gap: (item['Minimum Target'] || item['Desired State Score'] || 0) - (item['Current State Score'] || 0),
    }))
    .filter(item => item.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Remediation Priority List', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${today}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`${priorityItems.length} items requiring remediation`, pageWidth / 2, 34, { align: 'center' });

  // Priority table
  const tableData = priorityItems.slice(0, 50).map((item, index) => [
    (index + 1).toString(),
    item.ID,
    item['Subcategory Description']?.substring(0, 40) + '...' || '',
    (item['Current State Score'] || 0).toString(),
    (item['Minimum Target'] || item['Desired State Score'] || 0).toString(),
    item.gap.toFixed(1),
    item['Testing Status'] || 'Not Started',
  ]);

  doc.autoTable({
    startY: 45,
    head: [['#', 'ID', 'Description', 'Current', 'Target', 'Gap', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38] },
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 60 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 15 },
      6: { cellWidth: 25 },
    },
  });

  // High priority items detail (top 10)
  if (doc.lastAutoTable.finalY < 250) {
    doc.addPage();
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Priority Items - Details', 14, 20);

  let yPos = 30;
  priorityItems.slice(0, 10).forEach((item, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${item.ID} (Gap: ${item.gap.toFixed(1)})`, 14, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Category: ${item.Category || 'N/A'}`, 20, yPos);
    yPos += 5;

    const description = item['Subcategory Description'] || 'No description';
    const splitDesc = doc.splitTextToSize(description, pageWidth - 40);
    doc.text(splitDesc, 20, yPos);
    yPos += splitDesc.length * 4 + 3;

    if (item['Action Plan']) {
      doc.setFont('helvetica', 'italic');
      const actionPlan = `Action Plan: ${item['Action Plan']}`;
      const splitAction = doc.splitTextToSize(actionPlan, pageWidth - 40);
      doc.text(splitAction.slice(0, 3), 20, yPos);
      yPos += Math.min(splitAction.length, 3) * 4;
    }

    yPos += 8;
  });

  // Save
  doc.save(`CSF_Remediation_Priority_${today.replace(/\//g, '-')}.pdf`);
  toast.success('Remediation priority PDF generated');
}

/**
 * Generate a detailed assessment PDF for filtered data
 * @param {Array} data - The filtered CSF data
 * @param {Array} users - The users array
 * @param {string} filterDescription - Description of the applied filters
 */
export function generateFilteredReportPDF(data, users, filterDescription = 'Filtered View') {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString();

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CSF Profile Assessment Report', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${filterDescription} - ${data.length} items`, pageWidth / 2, 22, { align: 'center' });
  doc.text(`Generated: ${today}`, pageWidth / 2, 28, { align: 'center' });

  // Data table
  const tableData = data.map(item => [
    item.ID,
    item.Function,
    item['Category ID'] || '',
    item['Subcategory ID'] || '',
    item['In Scope? '] || 'No',
    (item['Current State Score'] || 0).toString(),
    (item['Desired State Score'] || 0).toString(),
    item['Testing Status'] || 'Not Started',
  ]);

  doc.autoTable({
    startY: 35,
    head: [['ID', 'Function', 'Category', 'Subcategory', 'In Scope', 'Current', 'Desired', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 10, right: 10 },
    styles: { fontSize: 8 },
  });

  // Save
  doc.save(`CSF_Report_${today.replace(/\//g, '-')}.pdf`);
  toast.success(`PDF report generated with ${data.length} items`);
}
