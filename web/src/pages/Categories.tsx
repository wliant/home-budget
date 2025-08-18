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
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Slide,
  Card,
  CardContent,
  Avatar,
  Stack,
  Skeleton,
  Tooltip,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandLess,
  ExpandMore,
  Circle,
  AttachMoney,
  Category as CategoryIcon,
  Folder,
  FolderOpen,
  Palette,
  TrendingUp,
  AccountTree,
  Close,
  Label,
  LocalOffer,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Category>({
    name: '',
    description: '',
    color: '#667eea',
    budgetAmount: 0,
    isActive: true,
  });
  const [parentCategoryId, setParentCategoryId] = useState<number | ''>('');

  const { categoryEntityApi } = useApiClients();
  const { showNotification } = useNotification();

  // Mock user ID - in real app, get from auth context
  const userId = 1;

  // Predefined color palette
  const colorPalette = [
    '#f093fb', '#f5576c', '#4facfe', '#00f2fe', 
    '#667eea', '#764ba2', '#fa709a', '#fee140',
    '#30cfd0', '#330867', '#43e97b', '#38f9d7',
    '#6a11cb', '#2575fc', '#f79d00', '#ee0979',
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axiosInstance.get(`/api/categories/user/${userId}/tree`);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showNotification('Failed to load categories', 'error');
      setLoading(false);
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
        color: category.color || '#667eea',
        budgetAmount: category.budgetAmount || 0,
        isActive: category.isActive !== false,
      });
      setParentCategoryId(category.parentCategory?.id || '');
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#667eea',
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
        await axiosInstance.put(`/api/categories/${editingCategory.id}`, categoryData);
        showNotification('Category updated successfully', 'success');
      } else {
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
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
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

  // Calculate statistics
  const totalCategories = getAllFlatCategories(categories).length;
  const totalBudget = getAllFlatCategories(categories).reduce((sum, cat) => sum + (cat.budgetAmount || 0), 0);
  const activeCategories = getAllFlatCategories(categories).filter(cat => cat.isActive !== false).length;

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.childCategories && category.childCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id!);
    const budgetPercentage = totalBudget > 0 ? ((category.budgetAmount || 0) / totalBudget) * 100 : 0;

    return (
      <React.Fragment key={category.id}>
        <Grow in timeout={600 + level * 100}>
          <ListItem 
            sx={{ 
              pl: 2 + level * 4,
              py: 1.5,
              borderRadius: 2,
              mb: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                transform: 'translateX(5px)',
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              {hasChildren && (
                <IconButton 
                  size="small" 
                  onClick={() => handleToggleExpand(category.id!)}
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                >
                  <ExpandMore />
                </IconButton>
              )}
              {!hasChildren && (
                <Box sx={{ width: 32 }} />
              )}
              
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: category.color || theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(category.color || theme.palette.primary.main, 0.3)}`,
                }}
              >
                {hasChildren ? <FolderOpen sx={{ fontSize: 20 }} /> : <Label sx={{ fontSize: 20 }} />}
              </Avatar>
              
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {category.name}
                  </Typography>
                  {category.budgetAmount && category.budgetAmount > 0 && (
                    <Chip
                      label={`$${category.budgetAmount.toFixed(0)}`}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {!category.isActive && (
                    <Chip
                      label="Inactive"
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
                {category.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {category.description}
                  </Typography>
                )}
                {category.budgetAmount && category.budgetAmount > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budgetPercentage, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(category.color || theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${category.color || theme.palette.primary.main} 0%, ${alpha(category.color || theme.palette.primary.main, 0.7)} 100%)`,
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {budgetPercentage.toFixed(1)}% of total budget
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit Category">
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenDialog(category)}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Category">
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteCategory(category.id!)}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItem>
        </Grow>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {category.childCategories!.map(child => renderCategory(child, level + 1))}
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Actions */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Category
          </Button>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>
        <Grow in timeout={600}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Categories
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {totalCategories}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <CategoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={800}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Budget
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${totalBudget.toFixed(0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={1000}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {activeCategories}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={1200}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Hierarchy Levels
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {Math.max(...categories.map(c => c.childCategories ? 2 : 1), 1)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                  <AccountTree />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Box>

      {/* Category List */}
      <Fade in timeout={1400}>
        <Paper 
          sx={{ 
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.9)
              : 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <CategoryIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={600}>
              Category Hierarchy
            </Typography>
          </Box>
          
          {loading ? (
            <Box>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 2 }} />
              ))}
            </Box>
          ) : categories.length === 0 ? (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 2,
              }}
            >
              <CategoryIcon sx={{ fontSize: 64, color: theme.palette.action.disabled, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No categories yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by creating your first category to organize expenses
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Create First Category
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {categories.map(category => renderCategory(category))}
            </List>
          )}
        </Paper>
      </Fade>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
          <IconButton 
            onClick={handleCloseDialog}
            sx={{ color: 'white' }}
            size="small"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              variant="outlined"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>Parent Category (Optional)</InputLabel>
              <Select
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value as number | '')}
                label="Parent Category (Optional)"
              >
                <MenuItem value="">
                  <em>None (Top Level)</em>
                </MenuItem>
                {getAllFlatCategories(categories)
                  .filter(cat => cat.id !== editingCategory?.id)
                  .map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Circle sx={{ color: cat.color, fontSize: 12 }} />
                        {cat.name}
                      </Box>
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
              helperText="Set a budget limit for this category"
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5 }}>
                Category Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colorPalette.map(color => (
                  <Tooltip key={color} title={color}>
                    <IconButton
                      onClick={() => setFormData({ ...formData, color })}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        border: formData.color === color ? '3px solid' : 'none',
                        borderColor: theme.palette.primary.main,
                        boxShadow: formData.color === color 
                          ? `0 0 0 2px ${alpha(color, 0.3)}`
                          : 'none',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 4px 12px ${alpha(color, 0.5)}`,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </Tooltip>
                ))}
                <TextField
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  sx={{ width: 40, height: 40 }}
                  inputProps={{
                    style: { 
                      padding: 0, 
                      width: 40, 
                      height: 40,
                      cursor: 'pointer',
                      border: 'none',
                      borderRadius: '50%',
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingCategory ? 'Update' : 'Create'} Category
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Categories;
