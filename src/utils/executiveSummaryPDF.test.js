import jsPDF from 'jspdf';
import { generateExecutiveSummary } from './executiveSummaryPDF';

// Regression guard for the jspdf-autotable v5 upgrade: v5 stopped patching
// jsPDF on import, which left doc.autoTable undefined and killed the
// Export summary button with only a transient toast.
describe('generateExecutiveSummary', () => {
  it('applies the autoTable plugin to jsPDF', () => {
    expect(typeof jsPDF.API.autoTable).toBe('function');
  });

  it('generates and saves the PDF without throwing for a fresh assessment', () => {
    // save lives in the jsPDF constructor closure, not on jsPDF.API, so
    // spyOn can't find it — but an API-level assignment wins at construction.
    const saveSpy = jest.fn().mockReturnThis();
    jsPDF.API.save = saveSpy;

    generateExecutiveSummary({
      assessment: {
        id: 'a-new',
        name: 'New Assessment',
        year: 2026,
        createdDate: '2026-07-31',
        scopeIds: ['GV.OC-01', 'ID.AM-01'],
        observations: {},
      },
      requirements: [],
      findings: [],
      artifacts: [],
      selectedQuarter: 2,
    });

    expect(saveSpy).toHaveBeenCalledWith('CSF-Executive-Summary.pdf');
    delete jsPDF.API.save;
  });
});
