import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Expenses from '../Expenses';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../api/axiosInstance';

// Mock axios instance
vi.mock('../../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock notification context
const mockShowNotification = vi.fn();
vi.mock('../../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNotification: () => ({
    showNotification: mockShowNotification,
  }),
}));

const mockExpenses = [
  {
    id: 1,
    description: 'Grocery shopping',
    amount: 50.00,
    date: new Date('2025-01-15'),
    category: { id: 1, name: 'Food', color: '#FF5733' },
    paymentMethod: 'CREDIT_CARD',
    notes: 'Weekly groceries',
    isRecurring: false,
  },
  {
    id: 2,
    description: 'Gas',
    amount: 30.00,
    date: new Date('2025-01-16'),
    category: { id: 2, name: 'Transport', color: '#33FF57' },
    paymentMethod: 'DEBIT_CARD',
    notes: 'Fuel for car',
    isRecurring: false,
  },
];

const mockCategories = [
  { id: 1, name: 'Food', color: '#FF5733' },
  { id: 2, name: 'Transport', color: '#33FF57' },
  { id: 3, name: 'Entertainment', color: '#3357FF' },
];

const renderExpenses = () => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <NotificationProvider>
        <Expenses />
      </NotificationProvider>
    </LocalizationProvider>
  );
};

describe('Expenses Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock responses
    (axiosInstance.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/expenses/user/')) {
        return Promise.resolve({ data: mockExpenses });
      }
      if (url.includes('/api/categories/user/')) {
        return Promise.resolve({ data: mockCategories });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  describe('Rendering', () => {
    it('should render the expenses page with header', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Add Expense')).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      renderExpenses();
      
      // Check for skeleton loaders (they are rendered initially)
      const skeletons = document.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display expenses after loading', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
        expect(screen.getByText('Gas')).toBeInTheDocument();
      });
    });

    it('should display statistics cards', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Total Expenses')).toBeInTheDocument();
        expect(screen.getByText('Transactions')).toBeInTheDocument();
        expect(screen.getByText('Average')).toBeInTheDocument();
        expect(screen.getByText('Recurring')).toBeInTheDocument();
      });
    });

    it('should calculate and display correct totals', async () => {
      renderExpenses();
      
      await waitFor(() => {
        // Total should be 50 + 30 = 80
        expect(screen.getByText('$80.00')).toBeInTheDocument();
        // Transaction count should be 2
        expect(screen.getByText('2')).toBeInTheDocument();
        // Average should be 80 / 2 = 40
        expect(screen.getByText('$40.00')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter expenses by search term', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search expenses...');
      await userEvent.type(searchInput, 'Gas');

      await waitFor(() => {
        expect(screen.queryByText('Grocery shopping')).not.toBeInTheDocument();
        expect(screen.getByText('Gas')).toBeInTheDocument();
      });
    });

    it('should filter expenses by category', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      // Find and click the category filter
      const categorySelect = screen.getByLabelText('Category');
      fireEvent.mouseDown(categorySelect);
      
      const foodOption = await screen.findByText('Food');
      fireEvent.click(foodOption);

      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
        expect(screen.queryByText('Gas')).not.toBeInTheDocument();
      });
    });

    it('should filter expenses by date range', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      // Click on "Today" filter
      const todayButton = screen.getByRole('button', { name: /today/i });
      fireEvent.click(todayButton);

      // Since our mock data is not from today, no expenses should be shown
      await waitFor(() => {
        expect(screen.queryByText('Grocery shopping')).not.toBeInTheDocument();
        expect(screen.queryByText('Gas')).not.toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open add expense dialog when clicking Add Expense button', async () => {
      renderExpenses();
      
      const addButton = await screen.findByText('Add Expense');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Expense')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      });
    });

    it('should create a new expense', async () => {
      (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 3, ...mockExpenses[0] } });
      
      renderExpenses();
      
      const addButton = await screen.findByText('Add Expense');
      fireEvent.click(addButton);

      const descriptionInput = await screen.findByLabelText('Description');
      const amountInput = screen.getByLabelText('Amount');
      
      await userEvent.type(descriptionInput, 'New expense');
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '100');

      const saveButton = screen.getByRole('button', { name: /add expense/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          '/api/expenses',
          expect.objectContaining({
            description: 'New expense',
            amount: 100,
          })
        );
        expect(mockShowNotification).toHaveBeenCalledWith('Expense created successfully', 'success');
      });
    });

    it('should open edit dialog when clicking edit button', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Expense')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Grocery shopping')).toBeInTheDocument();
      });
    });

    it('should update an expense', async () => {
      (axiosInstance.put as any).mockResolvedValueOnce({ data: { ...mockExpenses[0], description: 'Updated expense' } });
      
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const editButtons = await screen.findAllByTestId('EditIcon');
      fireEvent.click(editButtons[0]);

      const descriptionInput = await screen.findByDisplayValue('Grocery shopping');
      await userEvent.clear(descriptionInput);
      await userEvent.type(descriptionInput, 'Updated expense');

      const updateButton = screen.getByRole('button', { name: /update expense/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalledWith(
          '/api/expenses/1',
          expect.objectContaining({
            description: 'Updated expense',
          })
        );
        expect(mockShowNotification).toHaveBeenCalledWith('Expense updated successfully', 'success');
      });
    });

    it('should delete an expense with confirmation', async () => {
      window.confirm = vi.fn(() => true);
      (axiosInstance.delete as any).mockResolvedValueOnce({});
      
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const deleteButtons = await screen.findAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this expense?');
        expect(axiosInstance.delete).toHaveBeenCalledWith('/api/expenses/1');
        expect(mockShowNotification).toHaveBeenCalledWith('Expense deleted successfully', 'success');
      });
    });

    it('should not delete expense if user cancels confirmation', async () => {
      window.confirm = vi.fn(() => false);
      
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      const deleteButtons = await screen.findAllByTestId('DeleteIcon');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(axiosInstance.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe('View Modes', () => {
    it('should switch between list and grid view', async () => {
      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
      });

      // Default should be list view (table)
      expect(document.querySelector('table')).toBeInTheDocument();

      // Switch to grid view
      const gridViewButton = screen.getByTestId('ViewModuleIcon');
      fireEvent.click(gridViewButton);

      await waitFor(() => {
        expect(document.querySelector('table')).not.toBeInTheDocument();
        // In grid view, expenses are shown in cards
        const cards = document.querySelectorAll('.MuiCard-root');
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Recurring Expenses', () => {
    it('should display recurring expense indicator', async () => {
      const recurringExpense = {
        ...mockExpenses[0],
        isRecurring: true,
        recurrenceFrequency: 'MONTHLY',
      };
      
      (axiosInstance.get as any).mockImplementation((url: string) => {
        if (url.includes('/api/expenses/user/')) {
          return Promise.resolve({ data: [recurringExpense] });
        }
        if (url.includes('/api/categories/user/')) {
          return Promise.resolve({ data: mockCategories });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderExpenses();
      
      await waitFor(() => {
        expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
        // Check for recurring indicator
        const recurringChip = screen.getByText('Recurring');
        expect(recurringChip).toBeInTheDocument();
      });
    });

    it('should show recurrence frequency field when recurring is checked', async () => {
      renderExpenses();
      
      const addButton = await screen.findByText('Add Expense');
      fireEvent.click(addButton);

      const recurringCheckbox = await screen.findByLabelText('Recurring Expense');
      fireEvent.click(recurringCheckbox);

      await waitFor(() => {
        expect(screen.getByLabelText('Recurrence Frequency')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error notification when loading expenses fails', async () => {
      (axiosInstance.get as any).mockRejectedValueOnce(new Error('Network error'));
      
      renderExpenses();
      
      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith('Failed to load expenses', 'error');
      });
    });

    it('should show error notification when creating expense fails', async () => {
      (axiosInstance.post as any).mockRejectedValueOnce(new Error('Server error'));
      
      renderExpenses();
      
      const addButton = await screen.findByText('Add Expense');
      fireEvent.click(addButton);

      const descriptionInput = await screen.findByLabelText('Description');
      await userEvent.type(descriptionInput, 'New expense');

      const saveButton = screen.getByRole('button', { name: /add expense/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith('Failed to save expense', 'error');
      });
    });
  });
});
