import { usePagination } from './usePagination';
import { renderHook, act } from '@testing-library/react';

describe('usePagination Hook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(() => 
      usePagination({ initialPage: 3, initialPageSize: 20 })
    );

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageSize).toBe(20);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => 
      usePagination({ initialPage: 3 })
    );

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should not go to invalid page numbers', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.goToPage(0);
    });

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPage(-5);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should change page size', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setPageSize(25);
    });

    expect(result.current.pageSize).toBe(25);
  });

  it('should reset to page 1 when page size changes', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.currentPage).toBe(1);
  });

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setTotalItems(100);
    });

    expect(result.current.totalPages).toBe(10);
  });

  it('should handle total items not evenly divisible by page size', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setPageSize(7);
      result.current.setTotalItems(50);
    });

    expect(result.current.totalPages).toBe(8); // Math.ceil(50 / 7)
  });

  it('should reset pagination', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.goToPage(5);
      result.current.setPageSize(25);
      result.current.setTotalItems(200);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(0);
  });

  it('should provide hasNextPage correctly', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setTotalItems(30);
      result.current.setPageSize(10);
    });

    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.hasNextPage).toBe(false);
  });

  it('should provide hasPreviousPage correctly', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.hasPreviousPage).toBe(false);

    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.hasPreviousPage).toBe(true);
  });
});
