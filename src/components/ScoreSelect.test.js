import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoreSelect from './ScoreSelect';

describe('ScoreSelect', () => {
  it('renders two dropdowns: whole number and quarter fraction', () => {
    render(<ScoreSelect value={7} onChange={() => {}} maxScore={10} label="Actual Score" />);
    expect(screen.getByLabelText('Actual Score whole number')).toBeInTheDocument();
    expect(screen.getByLabelText('Actual Score quarter fraction')).toBeInTheDocument();
  });

  it('offers 0..10 wholes and .00/.25/.50/.75 fractions on the 10-point scale', () => {
    render(<ScoreSelect value={0} onChange={() => {}} maxScore={10} label="Score" />);
    const whole = screen.getByLabelText('Score whole number');
    const fraction = screen.getByLabelText('Score quarter fraction');
    expect(Array.from(whole.options).map(o => o.value)).toEqual(
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    );
    expect(Array.from(fraction.options).map(o => o.text)).toEqual(['.00', '.25', '.50', '.75']);
  });

  it('offers 0..5 wholes on the 5-point scale', () => {
    render(<ScoreSelect value={0} onChange={() => {}} maxScore={5} label="Score" />);
    const whole = screen.getByLabelText('Score whole number');
    expect(Array.from(whole.options).map(o => o.value)).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('composes whole + fraction into the numeric score', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={7} onChange={onChange} maxScore={10} label="Score" />);
    fireEvent.change(screen.getByLabelText('Score quarter fraction'), { target: { value: '0.25' } });
    expect(onChange).toHaveBeenCalledWith(7.25);
  });

  it('preserves the fraction when the whole changes below max', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={7.25} onChange={onChange} maxScore={10} label="Score" />);
    fireEvent.change(screen.getByLabelText('Score whole number'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith(3.25);
  });

  it('decomposes an existing half-point value into whole 7 + .50', () => {
    render(<ScoreSelect value={7.5} onChange={() => {}} maxScore={10} label="Score" />);
    expect(screen.getByLabelText('Score whole number').value).toBe('7');
    expect(screen.getByLabelText('Score quarter fraction').value).toBe('0.5');
  });

  it('locks the fraction to .00 at the scale maximum', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={10} onChange={onChange} maxScore={10} label="Score" />);
    const fraction = screen.getByLabelText('Score quarter fraction');
    expect(fraction).toBeDisabled();
    expect(fraction.value).toBe('0');
  });

  it('resets the fraction when the whole is raised to the maximum', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={9.75} onChange={onChange} maxScore={10} label="Score" />);
    fireEvent.change(screen.getByLabelText('Score whole number'), { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('locks the fraction at the 5-point maximum too', () => {
    render(<ScoreSelect value={5} onChange={() => {}} maxScore={5} label="Score" />);
    expect(screen.getByLabelText('Score quarter fraction')).toBeDisabled();
  });

  it('can never produce a value above the maximum', () => {
    const onChange = jest.fn();
    // Legacy out-of-band value renders clamped for display purposes.
    render(<ScoreSelect value={9.75} onChange={onChange} maxScore={10} label="Score" />);
    fireEvent.change(screen.getByLabelText('Score quarter fraction'), { target: { value: '0.75' } });
    expect(onChange).toHaveBeenCalledWith(9.75);
    expect(onChange).not.toHaveBeenCalledWith(expect.any(Number) > 10);
  });

  it('clamps an out-of-range-for-scale value (8 in a 5-point assessment) to the scale max for display', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={8} onChange={onChange} maxScore={5} label="Score" />);
    expect(screen.getByLabelText('Score whole number').value).toBe('5');
    expect(screen.getByLabelText('Score quarter fraction')).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('quarter points are selectable on the 5-point scale (4.75 works end-to-end)', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={4.5} onChange={onChange} maxScore={5} label="Score" />);
    fireEvent.change(screen.getByLabelText('Score quarter fraction'), { target: { value: '0.75' } });
    expect(onChange).toHaveBeenCalledWith(4.75);
  });

  it('displays off-step legacy values at the nearest quarter without writing', () => {
    const onChange = jest.fn();
    render(<ScoreSelect value={7.3} onChange={onChange} maxScore={10} label="Score" />);
    expect(screen.getByLabelText('Score whole number').value).toBe('7');
    expect(screen.getByLabelText('Score quarter fraction').value).toBe('0.25');
    expect(onChange).not.toHaveBeenCalled();
  });
});
