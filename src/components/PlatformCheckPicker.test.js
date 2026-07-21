import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PlatformCheckPicker from './PlatformCheckPicker';
import {
  forkPlatformProcedure,
  getPlatformProcedures,
  platformRecordContentHash
} from '../utils/platformBank';
import { composeAttachObservation } from '../utils/procedureTailor';
import { getBankProcedure } from '../utils/procedureBank';

/**
 * The post-create platform-check picker (plan PR-7). Presentation-only
 * contract tests: every affordance dispatches ONE operation object to the
 * page handler; the negative surfaces (no adopt on unresolved, no writes
 * on open/close) are asserted explicitly — an affordance that renders for
 * a state the producer refuses would be UI theater.
 */

const ITEM_ID = 'PR.AA-05 Ex1';
const offers = () => getPlatformProcedures('PR.AA-05', ['google-workspace', 'microsoft-365']);

const observationWith = (attachedOffers) =>
  composeAttachObservation(getBankProcedure(ITEM_ID), attachedOffers);

const setup = (observation, { canAttach = true } = {}) => {
  const onOperation = jest.fn();
  const onClose = jest.fn();
  render(
    <PlatformCheckPicker
      itemId={ITEM_ID}
      observation={observation}
      canAttach={canAttach}
      onOperation={onOperation}
      onClose={onClose}
    />
  );
  return { onOperation, onClose };
};

describe('PlatformCheckPicker', () => {
  test('opening and closing dispatches NO operation — the picker never writes on its own', () => {
    const { onOperation, onClose } = setup(observationWith(offers().slice(0, 2)));
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onOperation).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  test('Escape closes the dialog without dispatching; the dialog role is labeled', () => {
    const { onOperation, onClose } = setup(observationWith(offers().slice(0, 1)));
    expect(screen.getByRole('dialog', { name: `Platform checks for PR.AA-05` })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    expect(onOperation).not.toHaveBeenCalled();
  });

  test('attached rows render in entry order with Remove; a plain ref removes with ONE dispatch, no confirm', () => {
    const obs = observationWith(offers().slice(0, 2));
    const { onOperation } = setup(obs);
    const rows = screen.getAllByTestId('attached-check-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(obs.platformProcedures[0].policyId);
    fireEvent.click(within(rows[0]).getByTitle('Remove this platform check'));
    expect(onOperation).toHaveBeenCalledWith({ op: 'remove', ref: obs.platformProcedures[0] });
  });

  test('offered list: platform-grouped with counts, committed-map order, attached policies excluded', () => {
    const all = offers();
    const gws = all.filter((o) => o.record.platform === 'google-workspace');
    const attached = [gws[0]];
    setup(observationWith(attached));
    const gwsGroup = screen.getByTestId('offer-group-google-workspace');
    expect(gwsGroup).toHaveTextContent(`Google Workspace (${gws.length - 1} available)`);
    const offered = within(gwsGroup).getAllByTestId('offer-row');
    expect(offered).toHaveLength(gws.length - 1); // attached policy excluded
    offered.forEach((row, i) => {
      // committed-map order, minus the attached first policy
      expect(within(row).getByText(gws.slice(1)[i].policyId)).toBeInTheDocument();
    });
    expect(within(gwsGroup).queryByText(gws[0].policyId)).toBeNull();
  });

  test('Attach dispatches {op:add} with the exact offer; Attach all dispatches {op:addAll} with the group', () => {
    const all = offers();
    const gws = all.filter((o) => o.record.platform === 'google-workspace');
    const { onOperation } = setup(observationWith([]));
    const gwsGroup = screen.getByTestId('offer-group-google-workspace');
    const firstOfferRow = within(gwsGroup).getAllByTestId('offer-row')[0];
    fireEvent.click(within(firstOfferRow).getByTitle('Attach this platform check'));
    expect(onOperation).toHaveBeenLastCalledWith({ op: 'add', offer: expect.objectContaining({ policyId: gws[0].policyId }) });
    fireEvent.click(screen.getByText(`Attach all ${gws.length}`));
    expect(onOperation).toHaveBeenLastCalledWith({
      op: 'addAll',
      offers: expect.arrayContaining([expect.objectContaining({ policyId: gws[0].policyId })])
    });
  });

  test('canAttach=false: no offer rows, the attach-community-first explanation renders instead', () => {
    setup({ testProcedures: 'Hand-written.', platformProcedures: [] }, { canAttach: false });
    expect(screen.queryAllByTestId('offer-row')).toHaveLength(0);
    expect(screen.getByText(/use "insert community procedure" first/i)).toBeInTheDocument();
  });

  test('adopt: ONLY a drifted row offers "Adopt update"; the confirm names adoption and shows old vs new fingerprints + source link', () => {
    const base = observationWith(offers().slice(0, 2));
    const drifted = { ...base.platformProcedures[0], contentHash: '0000000000000000' };
    const obs = { ...base, platformProcedures: [drifted, base.platformProcedures[1]] };
    const { onOperation } = setup(obs);
    const rows = screen.getAllByTestId('attached-check-row');
    expect(rows[0]).toHaveTextContent('Updated upstream');
    expect(rows[1]).not.toHaveTextContent('Adopt update');
    fireEvent.click(screen.getByText('Adopt update'));
    const confirm = screen.getByTestId('adopt-confirm');
    expect(confirm).toHaveTextContent(`Adopt the upstream update for ${drifted.policyId}?`);
    expect(confirm).toHaveTextContent('attached version: 0000000000000000');
    const currentHash = platformRecordContentHash(
      offers().find((o) => o.policyId === drifted.policyId).record);
    expect(confirm).toHaveTextContent(`current version: ${currentHash}`);
    expect(within(confirm).getByRole('link')).toHaveAttribute(
      'href',
      offers().find((o) => o.policyId === drifted.policyId).record.attribution.sourceUrl);
    expect(onOperation).not.toHaveBeenCalled(); // nothing adopted before the confirm
    fireEvent.click(screen.getByText('Adopt upstream update'));
    expect(onOperation).toHaveBeenCalledWith({ op: 'adopt', ref: drifted });
  });

  test('adopt confirm Cancel dispatches nothing', () => {
    const base = observationWith(offers().slice(0, 1));
    const drifted = { ...base.platformProcedures[0], contentHash: '0000000000000000' };
    const { onOperation } = setup({ ...base, platformProcedures: [drifted] });
    fireEvent.click(screen.getByText('Adopt update'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onOperation).not.toHaveBeenCalled();
  });

  test('NEGATIVE: an unresolved row offers Remove only — no adopt affordance, no source link', () => {
    const FOREIGN = {
      corpusId: 'foreign-corpus',
      corpusVersion: 'ffffffffffffffff',
      policyId: 'gone.policy.1.1v1',
      contentHash: '0123456789abcdef'
    };
    const base = observationWith([]);
    const { onOperation } = setup({ ...base, platformProcedures: [FOREIGN] });
    const row = screen.getByTestId('attached-check-row');
    expect(row).toHaveTextContent('Unresolved');
    expect(row).not.toHaveTextContent('Adopt update');
    expect(within(row).queryByRole('link')).toBeNull();
    fireEvent.click(within(row).getByTitle('Remove this platform check'));
    expect(onOperation).toHaveBeenCalledWith({ op: 'remove', ref: FOREIGN });
  });

  test('a customized (forked) row removes through the in-dialog confirm showing the text to be discarded', () => {
    const base = observationWith(offers().slice(0, 1));
    const fork = forkPlatformProcedure(base.platformProcedures[0], 'My hardened variant of this check.');
    const { onOperation } = setup({ ...base, platformProcedures: [fork] });
    const row = screen.getByTestId('attached-check-row');
    expect(row).toHaveTextContent('customized');
    fireEvent.click(within(row).getByTitle('Remove this platform check'));
    expect(onOperation).not.toHaveBeenCalled(); // confirm first
    const confirm = screen.getByTestId('remove-fork-confirm');
    expect(confirm).toHaveTextContent('discard your edits');
    expect(confirm).toHaveTextContent('My hardened variant of this check.');
    fireEvent.click(screen.getByText('Remove and discard edits'));
    expect(onOperation).toHaveBeenCalledWith({ op: 'remove', ref: fork });
  });

  test('everything attached: the offered section states it plainly, zero offer rows', () => {
    setup(observationWith(offers()));
    expect(screen.queryAllByTestId('offer-row')).toHaveLength(0);
    expect(screen.getByText(/every available platform check for this subcategory is attached/i)).toBeInTheDocument();
  });
});
