import api from './api';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const normalizeLabel = (value, fallback = 'Unspecified') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return String(value)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDowntimeHours = (entry) => {
  if (entry.downtimeMinutes !== null && entry.downtimeMinutes !== undefined) {
    return toNumber(entry.downtimeMinutes) / 60;
  }
  return toNumber(entry.downtimeHours);
};

const groupEquipmentByStatus = (equipments) => {
  const grouped = equipments.reduce((acc, equipment) => {
    const status = normalizeLabel(equipment.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};

const groupDowntimeByMonth = (entries) => {
  const currentYear = new Date().getFullYear();
  const monthly = MONTH_LABELS.map((month) => ({ month, hours: 0 }));

  entries.forEach((entry) => {
    if (!entry.downtimeStart) {
      return;
    }

    const date = new Date(entry.downtimeStart);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) {
      return;
    }

    monthly[date.getMonth()].hours += getDowntimeHours(entry);
  });

  return monthly.map((item) => ({ ...item, hours: Number(item.hours.toFixed(2)) }));
};

const groupAssignmentsByVendor = (assignments) => {
  const grouped = assignments.reduce((acc, assignment) => {
    const vendorName = normalizeLabel(assignment.vendorName, 'Internal Team');
    const status = normalizeLabel(assignment.status);

    if (!acc[vendorName]) {
      acc[vendorName] = {
        vendor: vendorName,
        total: 0,
        completed: 0,
        open: 0,
        performance: 0,
      };
    }

    acc[vendorName].total += 1;
    if (status === 'Completed' || status === 'Closed') {
      acc[vendorName].completed += 1;
    } else {
      acc[vendorName].open += 1;
    }

    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      performance: item.total ? Math.round((item.completed / item.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
};

export const getDashboardSummary = () => api.get('/dashboard/summary').then((response) => response.data);

export const getDashboardData = async () => {
  const [summary, equipments, downtimeEntries, assignments] = await Promise.all([
    getDashboardSummary(),
    api.get('/equipment').then((response) => response.data),
    api.get('/maintenance/downtime').then((response) => response.data),
    api.get('/maintenance/assignments').then((response) => response.data),
  ]);

  return {
    summary,
    equipmentStatus: groupEquipmentByStatus(equipments),
    monthlyDowntime: groupDowntimeByMonth(downtimeEntries),
    vendorPerformance: groupAssignmentsByVendor(assignments),
  };
};
