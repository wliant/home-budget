import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import axiosInstance from '../api/axiosInstance';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  
  // Mock user ID - in real app, get from auth context
  const userId = 1;

  const [dashboardData, setDashboardData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    recentExpenses: [] as any[],
    categoryBreakdown: [] as any[],
    monthlyTrend: [] as any[],
    budgetAlerts: [] as any[],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [expensesRes, categoriesRes, budgetsRes] = await Promise.all([
        axiosInstance.get(`/api/expenses/user/${userId}`),
        axiosInstance.get(`/api/categories/user/${userId}/tree`),
        axiosInstance.get(`/api/budgets/user/${userId}`)
      ]);

      const expensesData = expensesRes.data.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      
      const categoriesData = categoriesRes.data;
      const budgetsData = budgetsRes.data;

      setExpenses(expensesData);
      setCategories(categoriesData);
      setBudgets(budgetsData);

      // Calculate dashboard metrics
      const totalBudget = budgetsData.reduce((sum: number, budget: any) => sum + (budget.amount || 0), 0);
      const totalSpent = expensesData.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
      const remainingBudget = totalBudget - totalSpent;

      // Get recent expenses (last 5)
      const recentExpenses = expensesData
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
        .map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          category: expense.category?.name || 'Uncategorized'
        }));

      // Calculate category breakdown
      const categoryMap = new Map();
      expensesData.forEach((expense: any) => {
        const categoryName = expense.category?.name || 'Uncategorized';
        const current = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, current + expense.amount);
      });

      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      // Calculate budget alerts
      const budgetAlerts = budgetsData.map((budget: any) => {
        const categoryExpenses = expensesData
          .filter((expense: any) => expense.category?.id === budget.category?.id)
          .reduce((sum: number, expense: any) => sum + expense.amount, 0);
        
        const percentage = budget.amount > 0 ? Math.round((categoryExpenses / budget.amount) * 100) : 0;
        let status = 'good';
        if (percentage >= 90) status = 'danger';
        else if (percentage >= 75) status = 'warning';
        
        return {
          category: budget.category?.name || 'Unknown',
          percentage,
          status
        };
      }).filter((alert: any) => alert.percentage > 0);

      // For monthly trend, we'll use mock data for now since we need historical data
      const monthlyTrend = [
        { month: 'Jan', budget: totalBudget, spent: totalSpent * 0.9 },
        { month: 'Feb', budget: totalBudget, spent: totalSpent * 0.85 },
        { month: 'Mar', budget: totalBudget, spent: totalSpent * 1.1 },
        { month: 'Apr', budget: totalBudget, spent: totalSpent * 0.95 },
        { month: 'May', budget: totalBudget, spent: totalSpent * 1.05 },
        { month: 'Current', budget: totalBudget, spent: totalSpent },
      ];

      setDashboardData({
        totalBudget,
        totalSpent,
        remainingBudget,
        recentExpenses,
        categoryBreakdown,
        monthlyTrend,
        budgetAlerts
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'danger') return <Warning color="error" />;
    if (status === 'warning') return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h5">
                ${dashboardData.totalBudget.toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <AccountBalance color="primary" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  This month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h5" color="error">
                ${dashboardData.totalSpent.toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp color="error" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  64% of budget
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h5" color="success.main">
                ${dashboardData.remainingBudget.toLocaleString()}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingDown color="success" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  36% left
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Transactions
              </Typography>
              <Typography variant="h5">
                {expenses.length}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Receipt color="action" />
                <Typography variant="body2" color="textSecondary" ml={1}>
                  This month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Budget Alerts
            </Typography>
            <List>
              {dashboardData.budgetAlerts.map((alert, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getStatusIcon(alert.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alert.category}
                    secondary={
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={alert.percentage}
                          color={getStatusColor(alert.percentage)}
                          sx={{ mt: 1, mb: 0.5 }}
                        />
                        <Typography variant="caption">
                          {alert.percentage}% of budget used
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Category Breakdown Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={dashboardData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {dashboardData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            <List>
              {dashboardData.recentExpenses.map((expense) => (
                <ListItem key={expense.id}>
                  <ListItemText
                    primary={expense.description}
                    secondary={format(expense.date, 'MMM dd, yyyy')}
                  />
                  <Box>
                    <Typography variant="body2" color="error">
                      -${expense.amount}
                    </Typography>
                    <Chip label={expense.category} size="small" />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Monthly Trend Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Spending Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value}`} />
                <Legend />
                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
