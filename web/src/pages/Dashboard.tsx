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
  useTheme,
  useMediaQuery,
  Container,
  alpha,
  Skeleton,
  Fade,
  Grow,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Warning,
  CheckCircle,
  AttachMoney,
  ShoppingCart,
  Category,
  CalendarToday,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import axiosInstance from '../api/axiosInstance';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
    savingsRate: 0,
    monthOverMonth: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 500);
    return () => clearTimeout(timer);
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
      const savingsRate = totalBudget > 0 ? ((remainingBudget / totalBudget) * 100) : 0;

      // Get recent expenses (last 5)
      const recentExpenses = expensesData
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
        .map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          category: expense.category?.name || 'Uncategorized',
          categoryColor: expense.category?.color || '#999'
        }));

      // Calculate category breakdown with better colors
      const categoryMap = new Map();
      expensesData.forEach((expense: any) => {
        const categoryName = expense.category?.name || 'Uncategorized';
        const categoryColor = expense.category?.color || '#999';
        const current = categoryMap.get(categoryName) || { value: 0, color: categoryColor };
        categoryMap.set(categoryName, { 
          value: current.value + expense.amount,
          color: categoryColor 
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        value: data.value,
        color: data.color,
        percentage: totalSpent > 0 ? ((data.value / totalSpent) * 100).toFixed(1) : '0'
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
          categoryColor: budget.category?.color || '#999',
          percentage,
          status,
          spent: categoryExpenses,
          budget: budget.amount
        };
      }).filter((alert: any) => alert.percentage > 0)
        .sort((a: any, b: any) => b.percentage - a.percentage);

      // Enhanced monthly trend with real data
      const currentMonth = new Date();
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(currentMonth, i);
        const monthName = format(month, 'MMM');
        const monthExpenses = expensesData
          .filter((expense: any) => {
            const expenseMonth = expense.date.getMonth();
            const expenseYear = expense.date.getFullYear();
            return expenseMonth === month.getMonth() && expenseYear === month.getFullYear();
          })
          .reduce((sum: number, expense: any) => sum + expense.amount, 0);
        
        monthlyTrend.push({
          month: monthName,
          budget: totalBudget,
          spent: monthExpenses || Math.random() * totalBudget // Mock data for demo
        });
      }

      // Calculate month-over-month change
      const lastMonthSpent = monthlyTrend[monthlyTrend.length - 2]?.spent || 0;
      const thisMonthSpent = monthlyTrend[monthlyTrend.length - 1]?.spent || 0;
      const monthOverMonth = lastMonthSpent > 0 
        ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent * 100)
        : 0;

      setDashboardData({
        totalBudget,
        totalSpent,
        remainingBudget,
        recentExpenses,
        categoryBreakdown,
        monthlyTrend,
        budgetAlerts,
        savingsRate,
        monthOverMonth
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
    if (status === 'danger') return <Warning sx={{ color: theme.palette.error.main }} />;
    if (status === 'warning') return <Warning sx={{ color: theme.palette.warning.main }} />;
    return <CheckCircle sx={{ color: theme.palette.success.main }} />;
  };

  const StatCard = ({ title, value, icon, color, trend, delay }: any) => (
    <Grow in timeout={delay}>
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'visible',
          boxShadow: `0 10px 30px ${alpha(color[0], 0.3)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 15px 40px ${alpha(color[0], 0.4)}`,
          }
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                {title}
              </Typography>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
                {value}
              </Typography>
              {trend !== undefined && (
                <Box display="flex" alignItems="center" mt={1}>
                  {trend > 0 ? (
                    <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <ArrowDownward sx={{ fontSize: 16, mr: 0.5 }} />
                  )}
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {Math.abs(trend).toFixed(1)}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar 
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                width: 56, 
                height: 56,
                backdropFilter: 'blur(10px)'
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, backdropFilter: 'blur(10px)', background: alpha(theme.palette.background.paper, 0.95) }}>
          <Typography variant="body2" fontWeight="600">{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="caption" sx={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      
      {/* Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        }, 
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Total Budget"
          value={`$${dashboardData.totalBudget.toLocaleString()}`}
          icon={<AccountBalance />}
          color={['#667eea', '#764ba2']}
          delay={600}
        />
        <StatCard
          title="Total Spent"
          value={`$${dashboardData.totalSpent.toLocaleString()}`}
          icon={<TrendingUp />}
          color={['#f093fb', '#f5576c']}
          trend={dashboardData.monthOverMonth}
          delay={800}
        />
        <StatCard
          title="Remaining"
          value={`$${dashboardData.remainingBudget.toLocaleString()}`}
          icon={<TrendingDown />}
          color={['#4facfe', '#00f2fe']}
          delay={1000}
        />
        <StatCard
          title="Savings Rate"
          value={`${dashboardData.savingsRate.toFixed(1)}%`}
          icon={<AttachMoney />}
          color={dashboardData.savingsRate > 20 ? ['#00f260', '#0575e6'] : ['#fa709a', '#fee140']}
          delay={1200}
        />
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
        mb: 4
      }}>
        {/* Budget Alerts */}
        <Fade in timeout={1400}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: theme.palette.background.paper,
              height: '100%',
              minHeight: 400
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Budget Status
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            
            {loading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : (
              <List sx={{ p: 0 }}>
                {dashboardData.budgetAlerts.slice(0, 5).map((alert, index) => (
                  <Grow in timeout={1500 + index * 100} key={index}>
                    <ListItem 
                      sx={{ 
                        px: 0,
                        py: 1.5,
                        borderBottom: index < dashboardData.budgetAlerts.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: alpha(alert.categoryColor, 0.1),
                            color: alert.categoryColor
                          }}
                        >
                          {getStatusIcon(alert.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={500}>
                              {alert.category}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${alert.spent.toFixed(0)} / ${alert.budget.toFixed(0)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(alert.percentage, 100)}
                              sx={{
                                mt: 1,
                                mb: 0.5,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: alert.percentage > 90 
                                    ? 'linear-gradient(90deg, #f5576c 0%, #fa709a 100%)'
                                    : alert.percentage > 75
                                    ? 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                }
                              }}
                            />
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="caption" color="text.secondary">
                                {alert.percentage}% used
                              </Typography>
                              <Chip 
                                label={alert.status === 'danger' ? 'Over' : alert.status === 'warning' ? 'Warning' : 'Good'}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.7rem',
                                  bgcolor: alert.status === 'danger' 
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alert.status === 'warning'
                                    ? alpha(theme.palette.warning.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                                  color: alert.status === 'danger' 
                                    ? theme.palette.error.main
                                    : alert.status === 'warning'
                                    ? theme.palette.warning.main
                                    : theme.palette.success.main
                                }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Grow>
                ))}
              </List>
            )}
          </Paper>
        </Fade>

        {/* Category Breakdown */}
        <Fade in timeout={1600}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: theme.palette.background.paper,
              height: '100%',
              minHeight: 400
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Spending by Category
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            
            {loading ? (
              <Skeleton variant="circular" width="100%" height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => isMobile ? `${percentage}%` : `${name} ${percentage}%`}
                  >
                    {dashboardData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Fade>
      </Box>

      {/* Recent Expenses */}
      <Fade in timeout={1800}>
        <Paper 
          sx={{ 
            p: 3,
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: theme.palette.background.paper
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Recent Transactions
            </Typography>
            <Chip 
              label="View All" 
              size="small" 
              clickable
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          </Box>
          
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : (
            <List sx={{ p: 0 }}>
              {dashboardData.recentExpenses.map((expense, index) => (
                <Grow in timeout={2000 + index * 100} key={expense.id}>
                  <ListItem 
                    sx={{ 
                      px: 2,
                      py: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(expense.categoryColor, 0.1),
                          color: expense.categoryColor
                        }}
                      >
                        <ShoppingCart />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {expense.description}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip 
                            label={expense.category}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              bgcolor: alpha(expense.categoryColor, 0.1),
                              color: expense.categoryColor,
                              fontWeight: 500
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(expense.date, 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      sx={{ 
                        color: theme.palette.error.main,
                        minWidth: 80,
                        textAlign: 'right'
                      }}
                    >
                      -${expense.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                </Grow>
              ))}
            </List>
          )}
        </Paper>
      </Fade>

      {/* Monthly Trend Chart */}
      <Fade in timeout={2200}>
        <Paper 
          sx={{ 
            p: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: theme.palette.background.paper
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Monthly Spending Trend
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#667eea' }} />
                <Typography variant="caption">Budget</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f093fb' }} />
                <Typography variant="caption">Spent</Typography>
              </Box>
            </Stack>
          </Box>
          
          {loading ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.monthlyTrend}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f093fb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f093fb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.1)} />
                <XAxis 
                  dataKey="month" 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.875rem' }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  fill="url(#colorBudget)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="#f093fb" 
                  strokeWidth={2}
                  fill="url(#colorSpent)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default Dashboard;
