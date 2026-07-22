import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScubaResultsImport from './ScubaResultsImport';

/**
 * Thin by design (PlatformCheckPicker precedent): the plan/apply logic is
 * pinned in scubaResultsImport.test.js, so this covers only what is UI-only —
 * the Apply gate (last defense against applying an empty plan), the parse
 * failure alert, and the exact onApply contract the page handler consumes.
 */
const REF = { corpusId: 'scuba', corpusVersion: 'v', policyId: 'ms.aad.1.1v1', contentHash: 'h' };
const OBS = { 'PR.AA-01 Ex1': { platformProcedures: [REF] } };
const VALID_FILE = JSON.stringify({
  Results: [{ 'Control ID': 'MS.AAD.1.1v1', Result: 'Pass' }]
});

const fakeFile = (name, text) => ({ name, text: async () => text });

const chooseFile = (file) => {
  fireEvent.change(screen.getByLabelText('ScubaResults.json file'), { target: { files: [file] } });
};

describe('ScubaResultsImport modal', () => {
  test('Apply is disabled before any file is chosen', () => {
    render(
      <ScubaResultsImport assessmentName="A" observationsByItem={OBS} onApply={jest.fn()} onClose={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: /Apply to 0 items/ })).toBeDisabled();
  });

  test('a parse failure renders the alert and Apply stays disabled', async () => {
    render(
      <ScubaResultsImport assessmentName="A" observationsByItem={OBS} onApply={jest.fn()} onClose={jest.fn()} />
    );
    chooseFile(fakeFile('junk.json', 'not json at all'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Not valid JSON');
    expect(screen.getByRole('button', { name: /Apply to 0 items/ })).toBeDisabled();
  });

  test('a matching file previews counts and Apply hands the exact plan to onApply', async () => {
    const onApply = jest.fn();
    render(
      <ScubaResultsImport assessmentName="A" observationsByItem={OBS} onApply={onApply} onClose={jest.fn()} />
    );
    chooseFile(fakeFile('ScubaResults.json', VALID_FILE));
    expect(await screen.findByText(/1 verdicts read/)).toBeInTheDocument();
    const apply = screen.getByRole('button', { name: /Apply to 1 item/ });
    expect(apply).toBeEnabled();
    fireEvent.click(apply);
    expect(onApply).toHaveBeenCalledWith(
      [{ itemId: 'PR.AA-01 Ex1', matches: [{ policyId: 'ms.aad.1.1v1', result: 'pass' }] }],
      expect.objectContaining({ tool: 'scubagear' })
    );
  });

  test('a zero-match file leaves Apply disabled and says why', async () => {
    render(
      <ScubaResultsImport assessmentName="A" observationsByItem={{}} onApply={jest.fn()} onClose={jest.fn()} />
    );
    chooseFile(fakeFile('ScubaResults.json', VALID_FILE));
    expect(await screen.findByText(/no\s+attached platform check/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply to 0 items/ })).toBeDisabled();
  });
});
