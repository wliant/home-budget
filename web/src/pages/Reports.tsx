import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  alpha,
  Fade,
  Grow,
  Card,
  CardContent,
  Avatar,
  Stack,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,

  AttachMoney,


  PieChart,
  BarChart,
  ShowChart,
  Assessment,
  Receipt,
  AccountBalance,

  LocalAtm,
  CreditCard,
  Savings,
  Timeline,
  DonutLarge,
  Analytics,
} from '@mui/icons-material';
import {


  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format } from 'date-fns';

const Reports = () => {
  const theme = useTheme();
  
  
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reportType, setReportType] = useState<'overview' | 'expenses' | 'categories' | 'trends'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', expenses: 2400, budget: 3000, income: 4500 },
    { month: 'Feb', expenses: 2800, budget: 3000, income: 4500 },
    { month: 'Mar', expenses: 2200, budget: 3000, income: 4500 },
    { month: 'Apr', expenses: 2900, budget: 3000, income: 4500 },
    { month: 'May', expenses: 3100, budget: 3000, income: 4500 },
    { month: 'Jun', expenses: 2600, budget: 3000, income: 4500 },
  ];

  const categoryData = [
    { name: 'Food & Dining', value: 1200, percentage: 30, color: '#f093fb' },
    { name: 'Transportation', value: 800, percentage: 20, color: '#4facfe' },
    { name: 'Shopping', value: 600, percentage: 15, color: '#667eea' },
    { name: 'Entertainment', value: 500, percentage: 12.5, color: '#fa709a' },
    { name: 'Bills & Utilities', value: 900, percentage: 22.5, color: '#30cfd0' },
  ];

  const weeklyTrend = [
    { day: 'Mon', amount: 120 },
    { day: 'Tue', amount: 85 },
    { day: 'Wed', amount: 200 },
    { day: 'Thu', amount: 150 },
    { day: 'Fri', amount: 300 },
    { day: 'Sat', amount: 250 },
    { day: 'Sun', amount: 180 },
  ];

  const paymentMethods = [
    { method: 'Credit Card', amount: 1800, count: 45 },
    { method: 'Cash', amount: 800, count: 32 },
    { method: 'Debit Card', amount: 600, count: 28 },
    { method: 'Digital Wallet', amount: 400, count: 15 },
    { method: 'Bank Transfer', amount: 400, count: 8 },
  ];

  const radarData = [
    { category: 'Food', current: 80, previous: 65, budget: 100 },
    { category: 'Transport', current: 70, previous: 90, budget: 100 },
    { category: 'Shopping', current: 60, previous: 40, budget: 100 },
    { category: 'Entertainment', current: 45, previous: 55, budget: 100 },
    { category: 'Bills', current: 95, previous: 95, budget: 100 },
    { category: 'Healthcare', current: 30, previous: 20, budget: 100 },
  ];

  // Calculate statistics
  const totalExpenses = 4000;
  const totalBudget = 3000;
  const totalIncome = 4500;
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  const budgetUtilization = (totalExpenses / totalBudget * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, backgroundColor: alpha(theme.palette.background.paper, 0.95) }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: ${entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Controls */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={(e, value) => value && setReportType(value)}
              size="small"
            >
              <ToggleButton value="overview">
                <Assessment />
              </ToggleButton>
              <ToggleButton value="expenses">
                <Receipt />
              </ToggleButton>
              <ToggleButton value="categories">
                <DonutLarge />
              </ToggleButton>
              <ToggleButton value="trends">
                <Timeline />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Fade>

      {/* Key Metrics */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        <Grow in timeout={600}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Total Expenses
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${totalExpenses}
                  </Typography>
                  <Chip
                    label="+12%"
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontSize: 11,
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}>
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={700}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Budget Used
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {budgetUtilization}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(budgetUtilization)}
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: alpha('#fff', 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#fff',
                      }
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}>
                  <PieChart sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={800}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Income
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${totalIncome}
                  </Typography>
                  <Chip
                    label="Stable"
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontSize: 11,
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}>
                  <AttachMoney sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={900}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Savings Rate
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {savingsRate}%
                  </Typography>
                  <Chip
                    label="-5%"
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontSize: 11,
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}>
                  <Savings sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        <Grow in timeout={1000}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(48, 207, 208, 0.3)',
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Transactions
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    128
                  </Typography>
                  <Chip
                    label="+8"
                    size="small"
                    sx={{ 
                      mt: 0.5,
                      backgroundColor: alpha('#fff', 0.2),
                      color: 'white',
                      fontSize: 11,
                    }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}>
                  <Receipt sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Box>

      {/* Main Charts */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
        gap: 3
      }}>
        {/* Spending Trend Chart */}
        <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 8' } }}>
          <Fade in timeout={1100}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Spending Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly expenses vs budget
                  </Typography>
                </Box>
                <ShowChart sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              {loading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4facfe" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#f093fb" 
                      fillOpacity={1} 
                      fill="url(#colorExpenses)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#4facfe" 
                      fillOpacity={1} 
                      fill="url(#colorBudget)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Fade>
        </Box>

        {/* Category Breakdown */}
        <Box sx={{ gridColumn: { xs: 'span 1', lg: 'span 4' } }}>
          <Fade in timeout={1200}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Category Breakdown
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expense distribution
                  </Typography>
                </Box>
                <DonutLarge sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {categoryData.map((category) => (
                      <Box key={category.name} display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                            }}
                          />
                          <Typography variant="body2">{category.name}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          ${category.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </>
              )}
            </Paper>
          </Fade>
        </Box>

        {/* Weekly Spending Pattern */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6', lg: 'span 6' } }}>
          <Fade in timeout={1300}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Weekly Pattern
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily spending habits
                  </Typography>
                </Box>
                <BarChart sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              {loading ? (
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Fade>
        </Box>

        {/* Category Comparison Radar */}
        <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6', lg: 'span 6' } }}>
          <Fade in timeout={1400}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Category Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current vs Previous vs Budget
                  </Typography>
                </Box>
                <Analytics sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              {loading ? (
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
                    <PolarAngleAxis dataKey="category" stroke={theme.palette.text.secondary} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={theme.palette.text.secondary} />
                    <Radar name="Current" dataKey="current" stroke="#f093fb" fill="#f093fb" fillOpacity={0.6} />
                    <Radar name="Previous" dataKey="previous" stroke="#4facfe" fill="#4facfe" fillOpacity={0.6} />
                    <Radar name="Budget" dataKey="budget" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Fade>
        </Box>

        {/* Payment Methods Table */}
        <Box sx={{ gridColumn: 'span 1' }}>
          <Fade in timeout={1500}>
            <Paper sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Payment Methods
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transaction breakdown by payment type
                  </Typography>
                </Box>
                <CreditCard sx={{ color: theme.palette.primary.main }} />
              </Box>
              
              {loading ? (
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Transactions</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentMethods.map((method) => {
                        const percentage = (method.amount / totalExpenses * 100).toFixed(1);
                        return (
                          <TableRow key={method.method}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                {method.method === 'Credit Card' && <CreditCard sx={{ color: theme.palette.primary.main }} />}
                                {method.method === 'Cash' && <LocalAtm sx={{ color: theme.palette.success.main }} />}
                                {method.method === 'Debit Card' && <AccountBalance sx={{ color: theme.palette.info.main }} />}
                                {method.method === 'Digital Wallet' && <AccountBalance sx={{ color: theme.palette.warning.main }} />}
                                {method.method === 'Bank Transfer' && <AccountBalance sx={{ color: theme.palette.secondary.main }} />}
                                {method.method}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600}>${method.amount}</Typography>
                            </TableCell>
                            <TableCell align="right">{method.count}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={parseFloat(percentage)}
                                  sx={{
                                    width: 100,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                    }
                                  }}
                                />
                                <Typography variant="body2">{percentage}%</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Fade>
        </Box>
      </Box>
    </Container>
  );
};

export default Reports;
