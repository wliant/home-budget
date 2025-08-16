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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandLess,
  ExpandMore,
  Circle,
  AttachMoney,
} from '@mui/icons-material';
import { useApiClients } from '../contexts/AxiosProvider';
import { useNotification } from '../contexts/NotificationContext';
import axiosInstance from '../api/axiosInstance';

interface Category {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  budgetAmount?: number;
  isActive?: boolean;
  parentCategory?: Category;
  childCategories?: Category[];
  user?: { id: number };
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
    color: '#1976d2',
    budgetAmount: 0,
    isActive: true,
  });
  const [parentCategoryId, setParentCategoryId] = useState<number | ''>('');

  const { categoryEntityApi } = useApiClients();
  const { showNotification } = useNotification();

  // Mock user ID - in real app, get from auth context
  const userId = 1;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Fetch category tree from backend
      const response = await axiosInstance.get(`/api/categories/user/${userId}/tree`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showNotification('Failed to load categories', 'error');
    }
  };

  const handleToggleExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color || '#1976d2',
        budgetAmount: category.budgetAmount || 0,
        isActive: category.isActive !== false,
      });
      setParentCategoryId(category.parentCategory?.id || '');
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#1976d2',
        budgetAmount: 0,
        isActive: true,
      });
      setParentCategoryId('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData = {
        ...formData,
        user: { id: userId },
        parentCategory: parentCategoryId ? { id: parentCategoryId } : undefined,
      };

      if (editingCategory) {
        // Update category
        await axiosInstance.put(`/api/categories/${editingCategory.id}`, categoryData);
        showNotification('Category updated successfully', 'success');
      } else {
        // Create category
        await axiosInstance.post('/api/categories', categoryData);
        showNotification('Category created successfully', 'success');
      }

      loadCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save category:', error);
      showNotification('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axiosInstance.delete(`/api/categories/${categoryId}`);
        showNotification('Category deleted successfully', 'success');
        loadCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        showNotification('Failed to delete category', 'error');
      }
    }
  };

  const getAllFlatCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.childCategories) {
        result.push(...getAllFlatCategories(cat.childCategories));
      }
    });
    return result;
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.childCategories && category.childCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id!);

    return (
      <React.Fragment key={category.id}>
        <ListItem style={{ paddingLeft: 16 + level * 32 }}>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Circle sx={{ color: category.color, fontSize: 16 }} />
                <Typography variant="body1">{category.name}</Typography>
                <Chip
                  label={`$${category.budgetAmount || 0}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            }
            secondary={category.description}
          />
          <ListItemSecondaryAction>
            {hasChildren && (
              <IconButton onClick={() => handleToggleExpand(category.id!)}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
            <IconButton onClick={() => handleOpenDialog(category)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteCategory(category.id!)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {category.childCategories!.map(child => renderCategory(child, level + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Category Hierarchy
        </Typography>
        <List>
          {categories.map(category => renderCategory(category))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Parent Category (Optional)</InputLabel>
              <Select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value as number | '')}
                label="Parent Category (Optional)"
              >
                <MenuItem value="">None</MenuItem>
                {getAllFlatCategories(categories)
                  .filter(cat => cat.id !== editingCategory?.id)
                  .map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Budget Amount"
              type="number"
              value={formData.budgetAmount}
              onChange={(e) => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) || 0 })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
