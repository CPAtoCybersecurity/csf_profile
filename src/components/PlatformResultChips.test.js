import React from 'react';
import { render, screen } from '@testing-library/react';
import PlatformResultChips from './PlatformResultChips';

describe('PlatformResultChips', () => {
  test('renders nothing for empty or junk input', () => {
    render(<PlatformResultChips entries={[]} />);
    render(<PlatformResultChips entries={null} />);
    expect(screen.queryByText(/SCuBA results/)).not.toBeInTheDocument();
  });

  test('renders verdict chips, the stamp, and the never-sets-the-score caveat', () => {
    render(
      <PlatformResultChips
        entries={[
          { policyId: 'ms.aad.1.1v1', result: 'pass', importedAt: '2026-07-21T00:00:00Z', reportDate: '2026-07-21' },
          { policyId: 'ms.aad.2.1v1', result: 'na', importedAt: '2026-07-21T00:00:00Z' }
        ]}
      />
    );
    expect(screen.getByText('MS.AAD.1.1V1')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    // Unknown-style verdicts fall back to the default chip style, still labeled
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText(/SCuBA results \(2026-07-21\)/)).toBeInTheDocument();
    expect(screen.getByText(/they do not set the score/i)).toBeInTheDocument();
  });
});
