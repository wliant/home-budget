import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid as MuiGrid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  CalendarToday,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';
import axiosInstance from '../api/axiosInstance';

interface Category {
  id: number;
  name: string;
  color?: string;
}

interface Expense {
  id?: number;
  description: string;
  amount: number;
  date: Date;
  category?: Category;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  user?: { id: number };
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<Expense>({
    description: '',
    amount: 0,
    date: new Date(),
    notes: '',
    isRecurring: false,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  const { showNotification } = useNotification();

  // Mock user ID - in real app, get from auth context
  const userId = 1;

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    try {
      // Fetch expenses from backend
      const response = await axiosInstance.get(`/api/expenses/user/${userId}`);
      // Convert date strings to Date objects
      const expensesData = response.data.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      setExpenses(expensesData);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      showNotification('Failed to load expenses', 'error');
    }
  };

  const loadCategories = async () => {
    try {
      // Fetch all categories from backend
      const response = await axiosInstance.get(`/api/categories/user/${userId}`);
      // Flatten the categories for the dropdown
      const flatCategories: Category[] = [];
      const flatten = (cats: any[]) => {
        cats.forEach(cat => {
          flatCategories.push({
            id: cat.id,
            name: cat.name,
            color: cat.color
          });
          if (cat.childCategories && cat.childCategories.length > 0) {
            flatten(cat.childCategories);
          }
        });
      };
      flatten(response.data);
      setCategories(flatCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showNotification('Failed to load categories', 'error');
    }
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        notes: expense.notes || '',
        isRecurring: expense.isRecurring || false,
        paymentMethod: expense.paymentMethod,
        recurrenceFrequency: expense.recurrenceFrequency,
      });
      setSelectedCategoryId(expense.category?.id || '');
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: 0,
        date: new Date(),
        notes: '',
        isRecurring: false,
      });
      setSelectedCategoryId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = async () => {
    try {
      const expenseData = {
        ...formData,
        user: { id: userId },
        category: selectedCategoryId ? { id: selectedCategoryId } : undefined,
      };

      if (editingExpense) {
        // Update expense
        await axiosInstance.put(`/api/expenses/${editingExpense.id}`, expenseData);
        showNotification('Expense updated successfully', 'success');
      } else {
        // Create expense
        await axiosInstance.post('/api/expenses', expenseData);
        showNotification('Expense created successfully', 'success');
      }

      loadExpenses();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save expense:', error);
      showNotification('Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/api/expenses/${expenseId}`);
        showNotification('Expense deleted successfully', 'success');
        loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        showNotification('Failed to delete expense', 'error');
      }
    }
  };

  const paymentMethods = [
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'DIGITAL_WALLET',
  ];

  const recurrenceFrequencies = [
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'QUARTERLY',
    'YEARLY',
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Expenses</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Expense
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {expense.description}
                    {expense.isRecurring && (
                      <Chip
                        label="Recurring"
                        size="small"
                        color="secondary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {expense.category && (
                      <Chip
                        label={expense.category.name}
                        size="small"
                        sx={{
                          backgroundColor: expense.category.color,
                          color: 'white',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="error">
                      ${expense.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell>{expense.notes}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(expense)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteExpense(expense.id!)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value as number | '')}
                  label="Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: cat.color,
                          }}
                        />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod || ''}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  label="Payment Method"
                >
                  <MenuItem value="">None</MenuItem>
                  {paymentMethods.map(method => (
                    <MenuItem key={method} value={method}>
                      {method.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isRecurring || false}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                }
                label="Recurring Expense"
              />
              {formData.isRecurring && (
                <FormControl fullWidth>
                  <InputLabel>Recurrence Frequency</InputLabel>
                  <Select
                    value={formData.recurrenceFrequency || ''}
                    onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                    label="Recurrence Frequency"
                  >
                    {recurrenceFrequencies.map(freq => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveExpense} variant="contained">
              {editingExpense ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Expenses;
