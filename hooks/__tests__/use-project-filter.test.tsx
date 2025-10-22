/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { useProjectFilter } from '../use-project-filter';
import React from 'react';

// Mock useLocalStorage to use React state instead
let mockStorageState: Record<string, any> = {};

jest.mock('../use-local-storage', () => ({
  useLocalStorage: jest.fn((key: string, initialValue: any) => {
    const [value, setValue] = React.useState(mockStorageState[key] ?? initialValue);

    React.useEffect(() => {
      mockStorageState[key] = value;
    }, [key, value]);

    const clearValue = () => {
      setValue(initialValue);
      delete mockStorageState[key];
    };

    return [value, setValue, clearValue];
  }),
}));

describe('useProjectFilter', () => {
  beforeEach(() => {
    mockStorageState = {};
    jest.clearAllMocks();
  });

  it('should initialize with empty selectedProjectIds', () => {
    const { result } = renderHook(() => useProjectFilter());

    expect(result.current.selectedProjectIds).toEqual([]);
  });

  it('should toggle a project on', () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject('project-1');
    });

    expect(result.current.selectedProjectIds).toEqual(['project-1']);
  });

  it('should toggle a project off', () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject('project-1');
    });

    expect(result.current.selectedProjectIds).toEqual(['project-1']);

    act(() => {
      result.current.toggleProject('project-1');
    });

    expect(result.current.selectedProjectIds).toEqual([]);
  });

  it('should toggle multiple projects', () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject('project-1');
      result.current.toggleProject('project-2');
    });

    expect(result.current.selectedProjectIds).toEqual(['project-1', 'project-2']);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject('project-1');
      result.current.toggleProject('project-2');
    });

    expect(result.current.selectedProjectIds).toEqual(['project-1', 'project-2']);

    act(() => {
      result.current.clearFilter();
    });

    expect(result.current.selectedProjectIds).toEqual([]);
  });

  it('should apply filter immediately without requiring refresh', async () => {
    // This test verifies that the filter state updates immediately
    // and doesn't require a browser refresh to take effect

    const { result, rerender } = renderHook(() => useProjectFilter());

    // Initially empty
    expect(result.current.selectedProjectIds).toEqual([]);

    // Toggle project - simulates user clicking a filter
    act(() => {
      result.current.toggleProject('project-1');
    });

    // Filter should apply immediately (no re-render needed)
    expect(result.current.selectedProjectIds).toEqual(['project-1']);

    // Verify it persists across re-renders
    rerender();
    expect(result.current.selectedProjectIds).toEqual(['project-1']);

    // Toggle another project
    act(() => {
      result.current.toggleProject('project-2');
    });

    // Should update immediately
    expect(result.current.selectedProjectIds).toEqual(['project-1', 'project-2']);
  });

  it('should trigger re-renders when selectedProjectIds changes', () => {
    let renderCount = 0;

    const TestComponent = () => {
      const { selectedProjectIds, toggleProject } = useProjectFilter();
      renderCount++;

      return (
        <div>
          <div data-testid="render-count">{renderCount}</div>
          <div data-testid="selected-count">{selectedProjectIds.length}</div>
          <button onClick={() => toggleProject('project-1')}>Toggle</button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(<TestComponent />);

    // Initial render
    expect(getByTestId('render-count')).toHaveTextContent('1');
    expect(getByTestId('selected-count')).toHaveTextContent('0');

    // Click to toggle project
    act(() => {
      getByText('Toggle').click();
    });

    // Should have re-rendered with new count
    expect(getByTestId('render-count')).toHaveTextContent('2');
    expect(getByTestId('selected-count')).toHaveTextContent('1');
  });
});

// Integration test that verifies filter applies to board without refresh
describe('Board Filter Integration', () => {
  beforeEach(() => {
    mockStorageState = {};
    jest.clearAllMocks();
  });

  it('should filter board tickets immediately when project filter changes', () => {
    const tickets = [
      { id: 'ticket-1', title: 'Ticket 1', projectId: 'project-1' },
      { id: 'ticket-2', title: 'Ticket 2', projectId: 'project-2' },
      { id: 'ticket-3', title: 'Ticket 3', projectId: 'project-3' },
    ];

    const BoardWithFilter = () => {
      const { selectedProjectIds, toggleProject } = useProjectFilter();

      // Filter tickets based on selected projects
      const filteredTickets = React.useMemo(() => {
        if (selectedProjectIds.length === 0) {
          return tickets;
        }
        return tickets.filter(ticket =>
          ticket.projectId && selectedProjectIds.includes(ticket.projectId)
        );
      }, [selectedProjectIds]);

      return (
        <div>
          <div data-testid="ticket-count">{filteredTickets.length}</div>
          <button onClick={() => toggleProject('project-1')}>
            Toggle Project 1
          </button>
          <button onClick={() => toggleProject('project-2')}>
            Toggle Project 2
          </button>
          <div>
            {filteredTickets.map(ticket => (
              <div key={ticket.id} data-testid={`ticket-${ticket.id}`}>
                {ticket.title}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const { getByTestId, getByText } = render(<BoardWithFilter />);

    // Initially all tickets visible
    expect(getByTestId('ticket-count')).toHaveTextContent('3');
    expect(screen.getByTestId('ticket-ticket-1')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-ticket-2')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-ticket-3')).toBeInTheDocument();

    // Toggle project-1 filter
    act(() => {
      getByText('Toggle Project 1').click();
    });

    // Should immediately show only project-1 tickets (without refresh)
    expect(getByTestId('ticket-count')).toHaveTextContent('1');
    expect(screen.getByTestId('ticket-ticket-1')).toBeInTheDocument();
    expect(screen.queryByTestId('ticket-ticket-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ticket-ticket-3')).not.toBeInTheDocument();

    // Toggle project-2 filter as well
    act(() => {
      getByText('Toggle Project 2').click();
    });

    // Should show both project-1 and project-2 tickets
    expect(getByTestId('ticket-count')).toHaveTextContent('2');
    expect(screen.getByTestId('ticket-ticket-1')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-ticket-2')).toBeInTheDocument();
    expect(screen.queryByTestId('ticket-ticket-3')).not.toBeInTheDocument();

    // Toggle off project-1
    act(() => {
      getByText('Toggle Project 1').click();
    });

    // Should show only project-2 tickets
    expect(getByTestId('ticket-count')).toHaveTextContent('1');
    expect(screen.queryByTestId('ticket-ticket-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('ticket-ticket-2')).toBeInTheDocument();
    expect(screen.queryByTestId('ticket-ticket-3')).not.toBeInTheDocument();
  });
});
