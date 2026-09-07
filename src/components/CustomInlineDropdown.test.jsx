// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomInlineDropdown from './CustomInlineDropdown';

describe('CustomInlineDropdown Component Tests', () => {
  const options = [
    { id: 'opt1', name: 'Option 1' },
    { id: 'opt2', name: 'Option 2' },
    { id: 'opt3', name: 'Option 3' },
    { id: 'opt4', name: 'Option 4' },
    { id: 'opt5', name: 'Option 5' }
  ];

  it('renders trigger with selected item name', () => {
    render(
      <CustomInlineDropdown
        label="Test Select"
        value="opt2"
        options={options}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Test Select')).toBeTruthy();
    expect(screen.getByText('Option 2')).toBeTruthy();
  });

  it('opens dropdown menu on trigger click and allows selection', () => {
    const handleChange = vi.fn();
    render(
      <CustomInlineDropdown
        label="Test Select"
        value="opt1"
        options={options}
        onChange={handleChange}
      />
    );

    const trigger = screen.getByText('Option 1');
    fireEvent.click(trigger);

    expect(screen.getByText('Option 3')).toBeTruthy();
    fireEvent.click(screen.getByText('Option 3'));

    expect(handleChange).toHaveBeenCalledWith('opt3');
  });
});
