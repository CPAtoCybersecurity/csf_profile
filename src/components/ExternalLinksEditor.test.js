import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExternalLinksEditor from './ExternalLinksEditor';

const TRACKING = {
  enabled: true,
  systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' }
};

const LINKS = [
  { id: 'XL-1', type: 'findings', url: 'https://jira.example/browse/SEC-1' },
  { id: 'XL-2', type: 'artifacts', url: 'https://sharepoint.example/sites/ev/AR-2' }
];

describe('ExternalLinksEditor (issue #288)', () => {
  test('edit mode renders all three typed groups labeled with the per-type system names', () => {
    render(<ExternalLinksEditor links={[]} onChange={jest.fn()} externalTracking={TRACKING} disabled={false} />);
    expect(screen.getByText('Finding links · Jira')).toBeInTheDocument();
    expect(screen.getByText('Artifact links · SharePoint')).toBeInTheDocument();
    expect(screen.getByText('Control links · Hyperproof')).toBeInTheDocument();
  });

  test('group titles fall back to generic labels when no system is named', () => {
    render(<ExternalLinksEditor links={[]} onChange={jest.fn()} externalTracking={undefined} disabled={false} />);
    expect(screen.getByText('Finding links')).toBeInTheDocument();
    expect(screen.getByText('Artifact links')).toBeInTheDocument();
    expect(screen.getByText('Control links')).toBeInTheDocument();
  });

  test('adding a valid URL calls onChange with the normalized appended link', () => {
    const onChange = jest.fn();
    render(<ExternalLinksEditor links={LINKS} onChange={onChange} externalTracking={TRACKING} disabled={false} />);
    const input = screen.getByPlaceholderText('https://... (Hyperproof)');
    fireEvent.change(input, { target: { value: 'https://grc.example/controls/CTL-9' } });
    fireEvent.click(screen.getAllByRole('button', { name: /add/i })[2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(3);
    expect(next[2]).toEqual(expect.objectContaining({
      type: 'controls',
      url: 'https://grc.example/controls/CTL-9'
    }));
    expect(next[2].id).toBeTruthy();
  });

  test('an invalid URL is rejected with a hint and onChange is never called', () => {
    const onChange = jest.fn();
    render(<ExternalLinksEditor links={[]} onChange={onChange} externalTracking={TRACKING} disabled={false} />);
    const input = screen.getByPlaceholderText('https://... (Jira)');
    fireEvent.change(input, { target: { value: 'not a url' } });
    fireEvent.click(screen.getAllByRole('button', { name: /add/i })[0]);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a full http:// or https:// URL.')).toBeInTheDocument();
  });

  test('removing a link calls onChange without that entry', () => {
    const onChange = jest.fn();
    render(<ExternalLinksEditor links={LINKS} onChange={onChange} externalTracking={TRACKING} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove finding link' }));

    expect(onChange).toHaveBeenCalledWith([LINKS[1]]);
  });

  test('read mode with no links shows the empty state and no inputs', () => {
    render(<ExternalLinksEditor links={[]} onChange={jest.fn()} externalTracking={TRACKING} disabled />);
    expect(screen.getByText('No external links.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('read mode renders http(s) links as safe anchors with noopener', () => {
    render(<ExternalLinksEditor links={LINKS} onChange={jest.fn()} externalTracking={TRACKING} disabled />);
    const anchor = screen.getByRole('link', { name: /SEC-1/ });
    expect(anchor).toHaveAttribute('href', 'https://jira.example/browse/SEC-1');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('a non-http url renders as plain text, never an anchor', () => {
    // eslint-disable-next-line no-script-url -- attack fixture: render must degrade to text
    const hostile = [{ id: 'XL-x', type: 'findings', url: 'javascript:alert(1)' }];
    render(<ExternalLinksEditor links={hostile} onChange={jest.fn()} externalTracking={TRACKING} disabled />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/alert\(1\)/)).toBeInTheDocument();
  });
});
