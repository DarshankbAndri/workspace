import React from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Build,
  Business,
  CheckCircle,
  EventRepeat,
  PrecisionManufacturing,
  Timeline,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDashboardData } from '../../services/dashboardService';
import { getSites } from '../../services/siteService';

const metricCards = [
  {
    key: 'totalEquipments',
    label: 'Total Equipments',
    helper: 'Registered production assets',
    icon: <PrecisionManufacturing />,
    color: '#003da5',
  },
  {
    key: 'activeVendors',
    label: 'Active Vendors',
    helper: 'Approved maintenance partners',
    icon: <Business />,
    color: '#2e7d32',
  },
  {
    key: 'openRequests',
    label: 'Open Maintenance Requests',
    helper: 'Work orders needing action',
    icon: <Build />,
    color: '#ed6c02',
  },
  {
    key: 'totalDowntimeHours',
    label: 'Total Downtime Hours',
    helper: 'Recorded equipment impact',
    icon: <Timeline />,
    color: '#6d4c41',
  },
];

const statusColors = ['#003da5', '#2e7d32', '#ed6c02', '#c62828', '#6a1b9a', '#00838f'];

const formatMetric = (value) => {
  const number = Number(value ?? 0);
  return Number.isInteger(number) ? number.toLocaleString() : number.toFixed(2);
};

function EmptyChart({ label }) {
  return (
    <Box
      sx={{
        height: 280,
        display: 'grid',
        placeItems: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const theme = useTheme();
  const [dashboard, setDashboard] = React.useState(null);
  const [sites, setSites] = React.useState([]);
  const [siteId, setSiteId] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;

    setLoading(true);
    getDashboardData(siteId || undefined)
      .then((data) => {
        if (mounted) {
          setDashboard(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Unable to load dashboard data from the CMMS APIs.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [siteId]);

  React.useEffect(() => {
    getSites()
      .then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load sites for dashboard filter.'));
  }, []);

  const summary = dashboard?.summary ?? {};
  const equipmentStatus = dashboard?.equipmentStatus ?? [];
  const monthlyDowntime = dashboard?.monthlyDowntime ?? [];
  const vendorPerformance = dashboard?.vendorPerformance ?? [];
  const upcomingMaintenance = dashboard?.upcomingMaintenance ?? [];
  const hasDowntime = monthlyDowntime.some((item) => item.hours > 0);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>CMMS Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Enterprise maintenance overview for assets, vendors, work orders, and downtime.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField select size="small" label="Site" value={siteId} onChange={(event) => setSiteId(event.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <Box
            sx={{
              alignSelf: { xs: 'flex-start', md: 'center' },
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.success.main, 0.12),
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <CheckCircle fontSize="small" />
            <Typography variant="caption" fontWeight={800}>Live API Metrics</Typography>
          </Box>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {metricCards.map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.key}>
              <Card sx={{ height: '100%', borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={700}>{card.label}</Typography>
                      <Typography variant="h4" fontWeight={900} sx={{ mt: 1, lineHeight: 1 }}>
                        {formatMetric(summary[card.key])}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                        {card.helper}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        color: card.color,
                        bgcolor: alpha(card.color, 0.12),
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12} lg={4}>
            <ChartCard title="Equipment Status" subtitle="Asset availability by current condition">
              {equipmentStatus.length ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={equipmentStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                        {equipmentStatus.map((entry, index) => (
                          <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Equipments']} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <EmptyChart label="No equipment status data available" />
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={8}>
            <ChartCard title="Monthly Downtime" subtitle={`${new Date().getFullYear()} downtime hours by month`}>
              {hasDowntime ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyDowntime} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`${value} hrs`, 'Downtime']} />
                      <Bar dataKey="hours" name="Downtime Hours" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <EmptyChart label="No downtime recorded for this year" />
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <ChartCard title="Upcoming Maintenance" subtitle="PM schedules due in the next 30 days">
              {upcomingMaintenance.length ? (
                <Stack spacing={1.25} sx={{ minHeight: 340 }}>
                  {upcomingMaintenance.slice(0, 6).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        gap: 1.25,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          flexShrink: 0,
                        }}
                      >
                        <EventRepeat fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={800} noWrap>{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>{item.equipmentName}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Due {item.nextDueDate} · {item.frequency} · {Number(item.completionPercentage || 0).toFixed(0)}% complete
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <EmptyChart label="No PM schedules due in the next 30 days" />
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} lg={8}>
            <ChartCard title="Vendor Performance" subtitle="Completed maintenance assignments by vendor">
              {vendorPerformance.length ? (
                <Box sx={{ height: 340 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorPerformance} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="vendor" tickLine={false} axisLine={false} interval={0} height={56} />
                      <YAxis yAxisId="left" tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="completed" name="Completed Jobs" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="open" name="Open Jobs" fill="#ed6c02" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="performance" name="Completion Rate %" fill="#003da5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <EmptyChart label="No vendor assignment data available" />
              )}
            </ChartCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DashboardPage;
