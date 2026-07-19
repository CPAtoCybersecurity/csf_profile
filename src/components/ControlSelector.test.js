import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ControlSelector from './ControlSelector';
import useControlsStore from '../stores/controlsStore';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const CONTROLS = [
  {
    controlId: 'DE.AE-02 Ex1',
    implementationDescription: 'CloudTrail and GuardDuty log monitoring',
    status: 'Implemented'
  },
  {
    controlId: 'GV.OC-01 Ex1',
    implementationDescription: 'Mission documented and communicated',
    status: 'Partially Implemented'
  }
];

const renderSelector = (props = {}) =>
  render(
    <MemoryRouter>
      <ControlSelector
        label="Controls"
        selectedControls={[]}
        onChange={jest.fn()}
        {...props}
      />
    </MemoryRouter>
  );

describe('ControlSelector (issue #294)', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useControlsStore.setState({ controls: CONTROLS });
  });

  test('read mode shows the empty state when nothing is linked', () => {
    renderSelector({ disabled: true });
    expect(screen.getByText('No controls linked')).toBeInTheDocument();
  });

  test('read-mode chips navigate to the Controls tab with the control preselected', () => {
    renderSelector({ disabled: true, selectedControls: ['DE.AE-02 Ex1'] });
    fireEvent.click(screen.getByText('DE.AE-02 Ex1'));
    expect(mockNavigate).toHaveBeenCalledWith('/controls?selected=DE.AE-02%20Ex1');
  });

  test('edit mode opens a dropdown listing controls from the register and selects on click', () => {
    const onChange = jest.fn();
    renderSelector({ onChange });
    fireEvent.click(screen.getByText('Select controls'));
    expect(screen.getByText('CloudTrail and GuardDuty log monitoring')).toBeInTheDocument();
    expect(screen.getByText('Partially Implemented')).toBeInTheDocument();
    fireEvent.click(screen.getByText('GV.OC-01 Ex1'));
    expect(onChange).toHaveBeenCalledWith(['GV.OC-01 Ex1']);
  });

  test('edit mode removes a selected control via its chip X', () => {
    const onChange = jest.fn();
    renderSelector({ onChange, selectedControls: ['DE.AE-02 Ex1', 'GV.OC-01 Ex1'] });
    fireEvent.click(screen.getByLabelText('Remove DE.AE-02 Ex1'));
    expect(onChange).toHaveBeenCalledWith(['GV.OC-01 Ex1']);
  });

  test('a tampered non-array value renders as empty instead of crashing', () => {
    renderSelector({ disabled: true, selectedControls: 'garbage' });
    expect(screen.getByText('No controls linked')).toBeInTheDocument();
  });

  test('empty register shows the create-controls-first hint in the dropdown', () => {
    useControlsStore.setState({ controls: [] });
    renderSelector();
    fireEvent.click(screen.getByText('Select controls'));
    expect(screen.getByText('No controls available')).toBeInTheDocument();
    expect(screen.getByText('Create controls in the Controls tab first')).toBeInTheDocument();
  });
});
