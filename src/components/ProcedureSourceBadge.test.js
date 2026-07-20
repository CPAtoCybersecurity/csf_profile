import React from 'react';
import { render, screen } from '@testing-library/react';
import ProcedureSourceBadge from './ProcedureSourceBadge';

/**
 * Provenance badge over the real component (PR-1, plan §7 R-10): the pin
 * that matters is the unrecognized-bank case — a record shared from a newer
 * build must render a visible badge, never silently lose its provenance.
 */
describe('ProcedureSourceBadge', () => {
  test('renders nothing without a source', () => {
    const { container } = render(<ProcedureSourceBadge source={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('community source renders the green Community badge', () => {
    render(<ProcedureSourceBadge source={{ bank: 'community', bankId: 'GV.OC-01', modified: false }} />);
    const badge = screen.getByText('Community');
    expect(badge.className).toContain('bg-green-100');
  });

  test('customized community source names the customization', () => {
    render(<ProcedureSourceBadge source={{ bank: 'community', bankId: 'GV.OC-01', modified: true }} />);
    expect(screen.getByText('Community · customized')).toBeInTheDocument();
  });

  test('tailored no-bank source renders the amber org-tailor badge', () => {
    render(<ProcedureSourceBadge source={{ bank: 'none', bankId: null, tailored: true, modified: true }} />);
    const badge = screen.getByText('Tailored to your org');
    expect(badge.className).toContain('bg-amber-100');
  });

  test('an unrecognized bank renders a VISIBLE badge naming the bank', () => {
    render(<ProcedureSourceBadge source={{ bank: 'scuba-gws', bankId: 'gws.commoncontrols.1.1v1', modified: false }} />);
    const badge = screen.getByText('scuba-gws');
    expect(badge.className).toContain('bg-blue-100');
  });

  test('a tailored unrecognized-bank source shows its bank, not the org-tailor label', () => {
    render(<ProcedureSourceBadge source={{ bank: 'scuba-gws', bankId: 'x', tailored: true, modified: true }} />);
    expect(screen.getByText('scuba-gws · customized')).toBeInTheDocument();
    expect(screen.queryByText('Tailored to your org')).not.toBeInTheDocument();
  });
});
