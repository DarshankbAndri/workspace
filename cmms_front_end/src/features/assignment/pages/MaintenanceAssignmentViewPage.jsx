import React from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Grid, LinearProgress, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Download, Edit, KeyboardBackspace } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  downloadAssignmentChecklistProof,
  downloadAssignmentWorkLogAttachment,
  getAssignmentChecklist,
  getAssignmentWorkLogs,
  getMaintenanceAssignmentById,
} from '../services/assignmentService';
import { getAssignmentSpares } from '../../spareParts/services/sparePartService';

const assignmentStatusColors = {
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const workLogStatusColors = {
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  FOLLOW_UP_REQUIRED: 'warning',
  CANCELLED: 'default',
};

const spareStatusColors = {
  REQUESTED: 'default',
  MANAGER_APPROVED: 'info',
  MANAGER_REJECTED: 'error',
  STORE_REVIEW: 'info',
  STOCK_AVAILABLE: 'success',
  STOCK_NOT_AVAILABLE: 'warning',
  PURCHASE_REQUESTED: 'warning',
  PURCHASE_RECEIVED: 'success',
  RESERVED: 'info',
  ISSUED: 'primary',
  PARTIALLY_CONSUMED: 'warning',
  CONSUMED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  RETURNED: 'default',
};

const formatLabel = (value) => value ? String(value).replaceAll('_', ' ') : '-';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatApiError = (err, fallback) => {
  const apiError = err.response?.data || err.apiError;
  if (!apiError) return fallback;
  const details = Array.isArray(apiError.details) && apiError.details.length
    ? ` ${apiError.details.map((detail) => detail.field ? `${detail.field}: ${detail.message}` : detail.message).join(' ')}`
    : '';
  const code = apiError.code ? ` (${apiError.code})` : '';
  const correlation = apiError.correlationId ? ` Correlation: ${apiError.correlationId}` : '';
  return `${apiError.message || fallback}${code}.${details}${correlation}`.trim();
};

const downloadBlob = (response, fallbackName) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{value || '-'}</Typography>
    </Box>
  );
}

function SectionShell({ title, children, action }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>{title}</Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

function MaintenanceAssignmentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tab, setTab] = React.useState(0);
  const [assignment, setAssignment] = React.useState(null);
  const [checklistRows, setChecklistRows] = React.useState([]);
  const [workLogRows, setWorkLogRows] = React.useState([]);
  const [spareRows, setSpareRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sectionLoading, setSectionLoading] = React.useState({ checklist: true, workLogs: true, spares: true });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    getMaintenanceAssignmentById(id)
      .then((data) => {
        if (active) setAssignment(data);
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load assignment.')))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  React.useEffect(() => {
    let active = true;
    setSectionLoading({ checklist: true, workLogs: true, spares: true });
    Promise.allSettled([
      getAssignmentChecklist(id),
      getAssignmentWorkLogs(id),
      getAssignmentSpares(id),
    ]).then(([checklistResult, workLogResult, spareResult]) => {
      if (!active) return;
      if (checklistResult.status === 'fulfilled') {
        setChecklistRows(checklistResult.value || []);
      } else {
        setError(formatApiError(checklistResult.reason, 'Unable to load assignment checklist.'));
      }
      if (workLogResult.status === 'fulfilled') {
        setWorkLogRows(workLogResult.value || []);
      } else {
        setError(formatApiError(workLogResult.reason, 'Unable to load technician work logs.'));
      }
      if (spareResult.status === 'fulfilled') {
        setSpareRows(spareResult.value || []);
      } else {
        setError(formatApiError(spareResult.reason, 'Unable to load spare usage.'));
      }
      setSectionLoading({ checklist: false, workLogs: false, spares: false });
    });
    return () => { active = false; };
  }, [id]);

  const materialCost = spareRows
    .filter((item) => ['CONSUMED', 'RETURNED', 'PARTIALLY_CONSUMED'].includes(item.status || 'CONSUMED'))
    .reduce((sum, item) => sum + (Number(item.consumedQty || item.quantityUsed || 0) * Number(item.unitCost || 0)), 0);
  const serviceCost = Number(assignment?.actualCost || 0);
  const totalActualCost = serviceCost + materialCost;
  const completedChecklistCount = checklistRows.filter((row) => ['COMPLETED', 'NOT_APPLICABLE'].includes(row.status)).length;
  const checklistProgress = checklistRows.length ? Math.round((completedChecklistCount / checklistRows.length) * 100) : 0;
  const completedWorkLogCount = workLogRows.filter((row) => row.completionStatus === 'COMPLETED').length;
  const workLogProgress = workLogRows.length ? Math.round((completedWorkLogCount / workLogRows.length) * 100) : 0;

  const handleDownloadProof = async (row, proof) => {
    try {
      const response = await downloadAssignmentChecklistProof(id, row.id, proof.id);
      downloadBlob(response, proof.originalFileName || 'proof');
    } catch (err) {
      setError(formatApiError(err, 'Unable to download checklist proof.'));
    }
  };

  const handleDownloadAttachment = async (row, attachment) => {
    try {
      const response = await downloadAssignmentWorkLogAttachment(id, row.id, attachment.id);
      downloadBlob(response, attachment.originalFileName || 'attachment');
    } catch (err) {
      setError(formatApiError(err, 'Unable to download work log attachment.'));
    }
  };

  const spareColumns = [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.2 },
    { field: 'requestedQty', headerName: 'Requested', minWidth: 110, flex: 0.5, valueGetter: ({ row }) => row.requestedQty ?? row.quantityUsed ?? '-' },
    { field: 'approvedQty', headerName: 'Approved', minWidth: 110, flex: 0.5, valueGetter: ({ value }) => value ?? '-' },
    { field: 'issuedQty', headerName: 'Issued', minWidth: 95, flex: 0.45, valueGetter: ({ value }) => value ?? '-' },
    { field: 'consumedQty', headerName: 'Consumed', minWidth: 110, flex: 0.5, valueGetter: ({ value }) => value ?? '-' },
    { field: 'unit', headerName: 'Unit', minWidth: 90, flex: 0.4 },
    { field: 'totalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7, valueFormatter: ({ value }) => value == null ? '-' : formatMoney(value) },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 170,
      flex: 0.8,
      renderCell: ({ row }) => {
        const status = row.status || 'CONSUMED';
        return <Chip size="small" label={formatLabel(status)} color={spareStatusColors[status] || 'default'} />;
      },
    },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1, valueGetter: ({ value }) => value || '-' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Assignment was not found.'}</Alert>
        <Button startIcon={<KeyboardBackspace />} onClick={() => navigate('/maintenance/assignments')}>Back</Button>
      </Box>
    );
  }

  const status = assignment.status || 'ASSIGNED';

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'flex-start' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h4" fontWeight={800}>Assignment {assignment.requestNumber || `#${assignment.id}`}</Typography>
            <Chip size="small" label={formatLabel(status)} color={assignmentStatusColors[status] || 'default'} />
          </Stack>
          <Typography variant="body2" color="text.secondary">{assignment.requestTitle || assignment.remarks || 'Maintenance assignment details'}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<KeyboardBackspace />} onClick={() => navigate('/maintenance/assignments')}>Back</Button>
          {hasPermission('ASSIGNMENT_UPDATE') && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/maintenance/assignments/${id}/edit`)}>Edit</Button>
          )}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={3}><DetailItem label="Site" value={assignment.siteName} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Vendor" value={assignment.vendorName} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Technician" value={assignment.assignedEmployeeName || assignment.assignedTo} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Assigned Date" value={formatDate(assignment.assignedDate)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Planned Start" value={formatDate(assignment.plannedStartDate)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Planned End" value={formatDate(assignment.plannedEndDate)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Actual Start" value={formatDate(assignment.actualStartDate)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Actual End" value={formatDate(assignment.actualEndDate)} /></Grid>
          <Grid item xs={12}><Divider /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Estimated Cost" value={formatMoney(assignment.estimatedCost)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Service/Vendor Cost" value={formatMoney(serviceCost)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Material Cost" value={formatMoney(materialCost)} /></Grid>
          <Grid item xs={12} md={3}><DetailItem label="Total Actual Cost" value={formatMoney(totalActualCost)} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 1, mb: 2 }}>
        <Tabs value={tab} onChange={(event, nextTab) => setTab(nextTab)} variant="scrollable" scrollButtons="auto">
          <Tab label="Details" />
          <Tab label={`Checklist (${completedChecklistCount}/${checklistRows.length})`} />
          <Tab label={`Work Logs (${completedWorkLogCount}/${workLogRows.length})`} />
          <Tab label={`Spare Parts (${spareRows.length})`} />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <SectionShell title="Request Details">
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}><DetailItem label="Request Number" value={assignment.requestNumber} /></Grid>
            <Grid item xs={12} md={4}><DetailItem label="Request Status" value={formatLabel(assignment.requestStatus)} /></Grid>
            <Grid item xs={12} md={4}><DetailItem label="Priority" value={formatLabel(assignment.requestPriority || assignment.priority)} /></Grid>
            <Grid item xs={12}><DetailItem label="Remarks" value={assignment.remarks} /></Grid>
          </Grid>
        </SectionShell>
      )}

      {tab === 1 && (
        <SectionShell
          title="Checklist"
          action={<Chip size="small" label={`${checklistProgress}%`} color={checklistProgress === 100 && checklistRows.length ? 'success' : 'warning'} />}
        >
          {sectionLoading.checklist && <LinearProgress sx={{ mb: 2 }} />}
          <LinearProgress variant="determinate" value={checklistProgress} sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {checklistRows.length === 0 && <Typography variant="body2" color="text.secondary">No checklist items.</Typography>}
            {checklistRows.map((row) => (
              <Box key={row.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" fontWeight={800}>{row.sequenceNumber}. {row.taskTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatLabel(row.responseType)}{row.required !== false ? ' | Required' : ''}{row.proofRequired ? ' | Proof' : ''}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}><Chip size="small" label={formatLabel(row.status || 'PENDING')} color={['COMPLETED', 'NOT_APPLICABLE'].includes(row.status) ? 'success' : 'warning'} /></Grid>
                  <Grid item xs={12} md={3}><DetailItem label="Response" value={row.responseValue} /></Grid>
                  <Grid item xs={12} md={3}><DetailItem label="Remarks" value={row.remarks} /></Grid>
                  {row.completedAt && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Completed {formatDateTime(row.completedAt)} {row.completedByName ? `by ${row.completedByName}` : ''}
                      </Typography>
                    </Grid>
                  )}
                  {(row.proofs || []).length > 0 && (
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(row.proofs || []).map((proof) => (
                          <Chip
                            key={proof.id}
                            size="small"
                            label={proof.originalFileName}
                            icon={<Download />}
                            onClick={() => handleDownloadProof(row, proof)}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Stack>
        </SectionShell>
      )}

      {tab === 2 && (
        <SectionShell
          title="Technician Work Logs"
          action={<Chip size="small" label={`${workLogProgress}% completed`} color={workLogProgress === 100 && workLogRows.length ? 'success' : 'warning'} />}
        >
          {sectionLoading.workLogs && <LinearProgress sx={{ mb: 2 }} />}
          <Stack spacing={1.5}>
            {workLogRows.length === 0 && <Typography variant="body2" color="text.secondary">No technician work logs.</Typography>}
            {workLogRows.map((row) => (
              <Box key={row.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" fontWeight={800}>{row.technicianName || row.technicianEmployeeCode}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDateTime(row.startTime)} - {formatDateTime(row.endTime)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Chip size="small" label={formatLabel(row.completionStatus)} color={workLogStatusColors[row.completionStatus] || 'default'} />
                  </Grid>
                  <Grid item xs={12} md={2}><DetailItem label="Issue Found" value={row.issueFound} /></Grid>
                  <Grid item xs={12} md={2}><DetailItem label="Action Taken" value={row.actionTaken} /></Grid>
                  <Grid item xs={12} md={3}><DetailItem label="Work Notes" value={row.workNotes} /></Grid>
                  {(row.attachments || []).length > 0 && (
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(row.attachments || []).map((attachment) => (
                          <Chip
                            key={attachment.id}
                            size="small"
                            label={attachment.originalFileName}
                            icon={<Download />}
                            onClick={() => handleDownloadAttachment(row, attachment)}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Stack>
        </SectionShell>
      )}

      {tab === 3 && (
        <SectionShell title="Spare Part Requests">
          {sectionLoading.spares && <LinearProgress sx={{ mb: 2 }} />}
          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={spareRows}
              columns={spareColumns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              localeText={{ noRowsLabel: 'No spare part requests.' }}
            />
          </Box>
        </SectionShell>
      )}
    </Box>
  );
}

export default MaintenanceAssignmentViewPage;
