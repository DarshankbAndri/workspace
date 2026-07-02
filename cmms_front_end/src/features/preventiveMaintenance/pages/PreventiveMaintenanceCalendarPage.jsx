import React from 'react';
import { Alert, Box, Button, ButtonGroup, Chip, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { AddTask, CalendarMonth, ChevronLeft, ChevronRight, Today, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import { generatePMWorkOrder, getPMCalendarSchedules } from '../services/preventiveMaintenanceService';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';

const dayMs = 24 * 60 * 60 * 1000;
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const priorityColors = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
};

const toDateKey = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString().slice(0, 10);
};

const addDays = (date, days) => new Date(date.getTime() + (days * dayMs));

const startOfWeek = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const startOfMonthGrid = (date) => startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));

const endOfMonthGrid = (date) => {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(0, 0, 0, 0);
  return addDays(end, 6 - end.getDay());
};

const formatHeaderDate = (date, viewMode) => {
  if (viewMode === 'month') {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

const formatApiError = (err, fallback) => {
  const apiError = err.response?.data || err.apiError;
  if (!apiError) return fallback;
  const code = apiError.code ? ` (${apiError.code})` : '';
  const correlation = apiError.correlationId ? ` Correlation: ${apiError.correlationId}` : '';
  return `${apiError.message || fallback}${code}.${correlation}`.trim();
};

const buildDays = (anchorDate, viewMode) => {
  const start = viewMode === 'month' ? startOfMonthGrid(anchorDate) : startOfWeek(anchorDate);
  const end = viewMode === 'month' ? endOfMonthGrid(anchorDate) : addDays(start, 6);
  const days = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    days.push(new Date(cursor));
  }
  return days;
};

function PreventiveMaintenanceCalendarPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [viewMode, setViewMode] = React.useState('month');
  const [anchorDate, setAnchorDate] = React.useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [filters, setFilters] = React.useState({ siteId: '', equipmentId: '' });
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const visibleDays = React.useMemo(() => buildDays(anchorDate, viewMode), [anchorDate, viewMode]);
  const rangeStart = toDateKey(visibleDays[0]);
  const rangeEnd = toDateKey(visibleDays[visibleDays.length - 1]);
  const filteredEquipments = React.useMemo(() => (
    equipments.filter((equipment) => !filters.siteId || String(equipment.siteId || '') === String(filters.siteId))
  ), [equipments, filters.siteId]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    getPMCalendarSchedules({
      startDate: rangeStart,
      endDate: rangeEnd,
      siteId: filters.siteId,
      equipmentId: filters.equipmentId,
    })
      .then((data) => setRows(data || []))
      .catch((err) => setError(formatApiError(err, 'Unable to load PM calendar.')))
      .finally(() => setLoading(false));
  }, [filters.equipmentId, filters.siteId, rangeEnd, rangeStart]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  React.useEffect(() => {
    Promise.all([getSites(), getEquipments()])
      .then(([siteRows, equipmentRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load calendar filters.')));
  }, []);

  const rowsByDate = React.useMemo(() => rows.reduce((grouped, row) => {
    if (!row.nextDueDate) return grouped;
    if (!grouped[row.nextDueDate]) grouped[row.nextDueDate] = [];
    grouped[row.nextDueDate].push(row);
    return grouped;
  }, {}), [rows]);

  const updateFilter = (field) => (event) => {
    const value = event.target.value;
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'siteId' ? { equipmentId: '' } : {}),
    }));
  };

  const moveRange = (direction) => {
    setAnchorDate((current) => (
      viewMode === 'month'
        ? new Date(current.getFullYear(), current.getMonth() + direction, 1)
        : addDays(current, direction * 7)
    ));
  };

  const goToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setAnchorDate(today);
  };

  const handleGenerate = async (schedule) => {
    setError('');
    setSuccess('');
    try {
      await generatePMWorkOrder(schedule.id);
      setSuccess(`Work order generated for ${schedule.scheduleCode || schedule.title}.`);
      loadRows();
    } catch (err) {
      setError(formatApiError(err, 'Unable to generate work order.'));
    }
  };

  const renderTask = (task) => {
    const priority = task.priority || 'MEDIUM';
    const overdue = task.nextDueDate && task.nextDueDate < toDateKey(new Date());
    return (
      <Box key={task.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
          <Typography variant="caption" fontWeight={800} sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title || task.scheduleCode}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View PM schedule">
              <IconButton size="small" onClick={() => navigate(`/maintenance/preventive/${task.id}/view`)}>
                <Visibility fontSize="inherit" />
              </IconButton>
            </Tooltip>
            {hasPermission('REQUEST_CREATE') && (
              <Tooltip title="Generate work order">
                <IconButton size="small" color="primary" onClick={() => handleGenerate(task)}>
                  <AddTask fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">{task.equipmentName || '-'}</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
          <Chip size="small" label={task.frequency || '-'} variant="outlined" />
          <Chip size="small" label={priority} color={priorityColors[priority] || 'default'} />
          {overdue && <Chip size="small" label="Overdue" color="error" variant="outlined" />}
        </Stack>
      </Box>
    );
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>PM Calendar</Typography>
          <Typography variant="body2" color="text.secondary">Review due preventive maintenance tasks by week or month.</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" startIcon={<Today />} onClick={goToday}>Today</Button>
          <ButtonGroup variant="outlined">
            <Button variant={viewMode === 'month' ? 'contained' : 'outlined'} onClick={() => setViewMode('month')}>Month</Button>
            <Button variant={viewMode === 'week' ? 'contained' : 'outlined'} onClick={() => setViewMode('week')}>Week</Button>
          </ButtonGroup>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ p: 2, borderRadius: 1, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <CommonDropdown
            label="Site"
            value={filters.siteId}
            onChange={updateFilter('siteId')}
            options={sites}
            placeholder="All Sites"
            clearable
            getOptionLabel={(site) => `${site.siteName} (${site.siteCode})`}
            getOptionValue={(site) => site.id}
            sx={{ minWidth: 240 }}
          />
          <CommonDropdown
            label="Equipment"
            value={filters.equipmentId}
            onChange={updateFilter('equipmentId')}
            options={filteredEquipments}
            placeholder="All Equipment"
            clearable
            getOptionLabel={(item) => `${item.equipmentCode} - ${item.equipmentName}`}
            getOptionValue={(item) => item.id}
            sx={{ minWidth: 260 }}
          />
          <Button variant="outlined" onClick={loadRows} startIcon={<CalendarMonth />} sx={{ minWidth: 140 }}>Refresh</Button>
        </Stack>
      </Paper>

      <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <IconButton onClick={() => moveRange(-1)}><ChevronLeft /></IconButton>
          <Typography variant="h6" fontWeight={800}>{formatHeaderDate(anchorDate, viewMode)}</Typography>
          <IconButton onClick={() => moveRange(1)}><ChevronRight /></IconButton>
        </Stack>
        {loading && <LinearProgress />}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: 1, borderColor: 'divider' }}>
          {weekdayLabels.map((label) => (
            <Box key={label} sx={{ p: 1, textAlign: 'center', bgcolor: 'action.hover', borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={800}>{label}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {visibleDays.map((day) => {
            const key = toDateKey(day);
            const tasks = rowsByDate[key] || [];
            const inCurrentMonth = day.getMonth() === anchorDate.getMonth();
            const isToday = key === toDateKey(new Date());
            return (
              <Box
                key={key}
                sx={{
                  minHeight: viewMode === 'month' ? 150 : 420,
                  p: 1,
                  borderRight: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: inCurrentMonth || viewMode === 'week' ? 'background.default' : 'action.hover',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={isToday ? 900 : 700} color={isToday ? 'primary.main' : 'text.primary'}>
                    {day.getDate()}
                  </Typography>
                  {tasks.length > 0 && <Chip size="small" label={tasks.length} color="primary" variant="outlined" />}
                </Stack>
                <Stack spacing={0.75}>
                  {tasks.slice(0, viewMode === 'month' ? 4 : 20).map(renderTask)}
                  {viewMode === 'month' && tasks.length > 4 && (
                    <Typography variant="caption" color="text.secondary">+{tasks.length - 4} more</Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

export default PreventiveMaintenanceCalendarPage;
