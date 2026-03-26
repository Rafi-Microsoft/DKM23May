import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBox } from './searchBox';

describe('SearchBox Component', () => {
  it('should render search input field', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });

  it('should call onSearch when user types and presses Enter', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });

  it('should update input value as user types', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'document search' } });

    expect(searchInput.value).toBe('document search');
  });

  it('should call onSearch when search button is clicked', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'button click test' } });

    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('button click test');
    });
  });

  it('should not call onSearch with empty string', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  it('should clear search input when clear button is clicked', () => {
    const mockOnSearch = jest.fn();
    const mockOnClear = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} onClear={mockOnClear} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    const clearButton = screen.getByLabelText(/clear/i);
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should accept placeholder prop', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} placeholder="Search documents..." />);

    const searchInput = screen.getByPlaceholderText('Search documents...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} disabled={true} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    expect(searchInput).toBeDisabled();
  });

  it('should trim whitespace from search query', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBox onSearch={mockOnSearch} />);

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: '  test query  ' } });
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });
});
