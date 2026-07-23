import React from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress, Paper, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { AddTask, Cancel, CheckCircle, Delete, Download, Edit, Inventory, KeyboardBackspace, Save, Undo, UploadFile } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../../shared/context/AuthContext';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import { getSites } from '../../site/services/siteService';
import { searchEmployees } from '../../employee/services/employeeService';
import { createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { getRequestsBySite } from '../../maintenanceRequest/services/maintenanceRequestService';
import {
  addAssignmentChecklistItem,
  addAssignmentWorkLog,
  deleteAssignmentChecklistItem,
  deleteAssignmentChecklistProof,
  deleteAssignmentWorkLog,
  deleteAssignmentWorkLogAttachment,
  downloadAssignmentChecklistProof,
  downloadAssignmentWorkLogAttachment,
  getAssignmentChecklist,
  getAssignmentWorkLogs,
  getMaintenanceAssignmentById,
  updateAssignmentChecklistItem,
  updateAssignmentWorkLog,
  updateMaintenanceAssignment,
  uploadAssignmentChecklistProof,
  uploadAssignmentWorkLogAttachment,
} from '../services/assignmentService';
import {
  addAssignmentSpare,
  cancelAssignmentSpare,
  consumeAssignmentSpare,
  deleteAssignmentSpare,
  getAssignmentSpares,
  getSparePartsBySite,
  issueAssignmentSpare,
  rejectAssignmentSpare,
  reserveAssignmentSpare,
  returnAssignmentSpare,
  updateAssignmentSpare,
} from '../../spareParts/services/sparePartService';
import { getEquipmentSpareBom } from '../../equipment/services/equipmentService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDateTimePicker from '../../../shared/components/common/CommonDateTimePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import { getDropdownOptions } from '../../../shared/utils/dropdownHelper';

const initialForm = {
  siteId: '',
  requestId: '',
  vendorId: '',
  assignedEmployeeId: '',
  assignedTo: '',
  assignedDate: new Date().toISOString().slice(0, 10),
  plannedStartDate: '',
  plannedEndDate: '',
  actualStartDate: '',
  actualEndDate: '',
  status: 'ASSIGNED',
  estimatedCost: '',
  actualCost: '',
  remarks: '',
};

const initialSpareEditDialog = { open: false, row: null, quantityUsed: '', remarks: '' };
const initialChecklistForm = { taskTitle: '', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX' };
const initialWorkLogForm = {
  technicianEmployeeId: '',
  startTime: '',
  endTime: '',
  workNotes: '',
  issueFound: '',
  actionTaken: '',
  completionStatus: 'IN_PROGRESS',
};

const checklistStatusDropdownOptions = getDropdownOptions('MAINTENANCE_ASSIGNMENT', 'checklistStatus');
const checklistResponseOptions = getDropdownOptions('COMMON', 'checklistResponseType');
const workLogStatusDropdownOptions = getDropdownOptions('MAINTENANCE_ASSIGNMENT', 'workLogStatus');
const manualTechnicianOptions = getDropdownOptions('MAINTENANCE_ASSIGNMENT', 'manualTechnicianOption');
const assignmentStatusBaseOptions = getDropdownOptions('MAINTENANCE_ASSIGNMENT', 'assignmentStatus');

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

const toDateTimeInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 16);
};

const toApiDateTime = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

const employeeLabel = (employee) => {
  const name = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  return `${employee.employeeCode || employee.id} - ${name || 'Employee'}`;
};

const normalizeAssignmentForm = (data = {}) => ({
  ...initialForm,
  ...data,
  siteId: data.siteId || '',
  requestId: data.requestId || '',
  vendorId: data.vendorId || '',
  assignedEmployeeId: data.assignedEmployeeId || '',
  estimatedCost: data.estimatedCost ?? '',
  actualCost: data.actualCost ?? '',
});

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
  const [editingSection, setEditingSection] = React.useState('');
  const [assignment, setAssignment] = React.useState(null);
  const [detailForm, setDetailForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const [siteSpares, setSiteSpares] = React.useState([]);
  const [recommendedSpareBom, setRecommendedSpareBom] = React.useState([]);
  const [checklistRows, setChecklistRows] = React.useState([]);
  const [checklistForm, setChecklistForm] = React.useState(initialChecklistForm);
  const [workLogRows, setWorkLogRows] = React.useState([]);
  const [workLogForm, setWorkLogForm] = React.useState(initialWorkLogForm);
  const [editingWorkLogId, setEditingWorkLogId] = React.useState(null);
  const [spareRows, setSpareRows] = React.useState([]);
  const [spareForm, setSpareForm] = React.useState({ stockId: '', quantityUsed: '', remarks: '' });
  const [spareEditDialog, setSpareEditDialog] = React.useState(initialSpareEditDialog);
  const [loading, setLoading] = React.useState(true);
  const [savingSection, setSavingSection] = React.useState('');
  const [sectionLoading, setSectionLoading] = React.useState({ checklist: true, workLogs: true, spares: true });
  const [confirmDialog, setConfirmDialog] = React.useState({ open: false, title: '', message: '', resolve: null });
  const [error, setError] = React.useState('');

  const loadAssignment = React.useCallback(() => {
    setLoading(true);
    return getMaintenanceAssignmentById(id)
      .then((data) => {
        setAssignment(data);
        setDetailForm(normalizeAssignmentForm(data));
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load assignment.')))
      .finally(() => setLoading(false));
  }, [id]);

  const loadChecklist = React.useCallback(() => {
    setSectionLoading((current) => ({ ...current, checklist: true }));
    return getAssignmentChecklist(id)
      .then((data) => setChecklistRows(data || []))
      .catch((err) => setError(formatApiError(err, 'Unable to load assignment checklist.')))
      .finally(() => setSectionLoading((current) => ({ ...current, checklist: false })));
  }, [id]);

  const loadWorkLogs = React.useCallback(() => {
    setSectionLoading((current) => ({ ...current, workLogs: true }));
    return getAssignmentWorkLogs(id)
      .then((data) => setWorkLogRows(data || []))
      .catch((err) => setError(formatApiError(err, 'Unable to load technician work logs.')))
      .finally(() => setSectionLoading((current) => ({ ...current, workLogs: false })));
  }, [id]);

  const loadSpares = React.useCallback(() => {
    setSectionLoading((current) => ({ ...current, spares: true }));
    return getAssignmentSpares(id)
      .then((data) => setSpareRows(data || []))
      .catch((err) => setError(formatApiError(err, 'Unable to load spare usage.')))
      .finally(() => setSectionLoading((current) => ({ ...current, spares: false })));
  }, [id]);

  React.useEffect(() => { loadAssignment(); }, [loadAssignment]);
  React.useEffect(() => { loadChecklist(); }, [loadChecklist]);
  React.useEffect(() => { loadWorkLogs(); }, [loadWorkLogs]);
  React.useEffect(() => { loadSpares(); }, [loadSpares]);

  React.useEffect(() => {
    getSites()
      .then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE')))
      .catch((err) => setError(formatApiError(err, 'Unable to load sites.')));
  }, []);

  React.useEffect(() => {
    if (!detailForm.siteId) {
      setRequests([]);
      setVendors([]);
      setEmployees([]);
      setSiteSpares([]);
      return;
    }
    const employeePayload = createSearchPayload({
      filters: [equalFilter('siteId', detailForm.siteId, 'NUMBER'), equalFilter('status', 'ACTIVE')],
      paginationModel: { page: 0, pageSize: 200 },
      sortModel: [{ field: 'firstName', sort: 'asc' }],
    });
    Promise.all([getRequestsBySite(detailForm.siteId), getVendorsBySite(detailForm.siteId), getSparePartsBySite(detailForm.siteId), searchEmployees(employeePayload)])
      .then(([requestRows, vendorRows, spareRows, employeeRows]) => {
        setRequests((requestRows || []).filter((request) => !['PENDING_APPROVAL', 'CLOSE_PENDING_APPROVAL', 'REJECTED'].includes(request.status)));
        setVendors(vendorRows || []);
        setSiteSpares(spareRows || []);
        setEmployees(employeeRows?.data || []);
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load requests, vendors, technicians, or spare parts for selected site.')));
  }, [detailForm.siteId]);

  React.useEffect(() => {
    if (!assignment?.equipmentId) {
      setRecommendedSpareBom([]);
      return;
    }
    getEquipmentSpareBom(assignment.equipmentId)
      .then((data) => setRecommendedSpareBom((data || []).filter((row) => row.status !== 'INACTIVE')))
      .catch((err) => setError(formatApiError(err, 'Unable to load recommended equipment spares.')));
  }, [assignment?.equipmentId]);

  React.useEffect(() => {
    if (!editingWorkLogId && detailForm.assignedEmployeeId && !workLogForm.technicianEmployeeId) {
      setWorkLogForm((current) => ({ ...current, technicianEmployeeId: detailForm.assignedEmployeeId }));
    }
  }, [detailForm.assignedEmployeeId, editingWorkLogId, workLogForm.technicianEmployeeId]);

  const materialCost = spareRows
    .filter((item) => ['CONSUMED', 'RETURNED', 'PARTIALLY_CONSUMED'].includes(item.status || 'CONSUMED'))
    .reduce((sum, item) => sum + (Number(item.consumedQty || item.quantityUsed || 0) * Number(item.unitCost || 0)), 0);
  const serviceCost = Number(detailForm.actualCost || 0);
  const totalActualCost = serviceCost + materialCost;
  const completedChecklistCount = checklistRows.filter((row) => ['COMPLETED', 'NOT_APPLICABLE'].includes(row.status)).length;
  const checklistProgress = checklistRows.length ? Math.round((completedChecklistCount / checklistRows.length) * 100) : 0;
  const canCompleteChecklist = checklistRows.every((row) => {
    if (row.required === false) return true;
    const statusDone = ['COMPLETED', 'NOT_APPLICABLE'].includes(row.status);
    const proofDone = !row.proofRequired || (row.proofs || []).length > 0;
    return statusDone && proofDone;
  });
  const completedWorkLogCount = workLogRows.filter((row) => row.completionStatus === 'COMPLETED').length;
  const workLogProgress = workLogRows.length ? Math.round((completedWorkLogCount / workLogRows.length) * 100) : 0;
  const canCompleteWorkLogs = completedWorkLogCount > 0 && workLogRows.every((row) => !['IN_PROGRESS', 'FOLLOW_UP_REQUIRED'].includes(row.completionStatus));

  const updateDetailField = (field) => (event) => setDetailForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setDetailForm((current) => ({ ...current, siteId: event.target.value, requestId: '', vendorId: '' }));
  const updateRequest = (event) => setDetailForm((current) => ({ ...current, requestId: event.target.value, vendorId: '' }));
  const updateChecklistForm = (field) => (event) => setChecklistForm((current) => ({ ...current, [field]: event.target.value }));
  const updateWorkLogForm = (field) => (event) => setWorkLogForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSpareField = (field) => (event) => setSpareForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSpareStock = (event) => {
    const stockId = event.target.value;
    const recommended = recommendedSpareBom.find((row) => String(row.stockId) === String(stockId));
    setSpareForm((current) => ({
      ...current,
      stockId,
      quantityUsed: recommended && !current.quantityUsed ? recommended.recommendedQty : current.quantityUsed,
      remarks: recommended && !current.remarks ? `Recommended for ${assignment?.equipmentCode || assignment?.equipmentName || 'equipment'}` : current.remarks,
    }));
  };
  const updateChecklistRow = (rowId, field, value) => {
    setChecklistRows((current) => current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };
  const updateAssignedEmployee = (event) => {
    const employeeId = event.target.value;
    const selected = employees.find((employee) => String(employee.id) === String(employeeId));
    setDetailForm((current) => ({
      ...current,
      assignedEmployeeId: employeeId,
      assignedTo: selected ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim() : current.assignedTo,
    }));
  };

  const requestConfirmation = React.useCallback((title, message) => new Promise((resolve) => {
    setConfirmDialog({ open: true, title, message, resolve });
  }), []);

  const closeConfirmation = (confirmed) => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(confirmed);
    }
    setConfirmDialog({ open: false, title: '', message: '', resolve: null });
  };

  const startEditing = (section) => {
    setError('');
    setEditingSection(section);
    if (section === 'main' || section === 'details') {
      setDetailForm(normalizeAssignmentForm(assignment));
    }
  };

  const stopEditing = () => {
    setEditingSection('');
    setDetailForm(normalizeAssignmentForm(assignment));
    setChecklistForm(initialChecklistForm);
    setSpareForm({ stockId: '', quantityUsed: '', remarks: '' });
    setEditingWorkLogId(null);
    setWorkLogForm(initialWorkLogForm);
  };

  const handleSaveAssignmentSection = async () => {
    setError('');
    if (!detailForm.siteId || !detailForm.requestId || !detailForm.vendorId) {
      setError('Site, maintenance request, and vendor are required.');
      return;
    }
    if (!detailForm.assignedEmployeeId && !String(detailForm.assignedTo || '').trim()) {
      setError('Assigned technician is required.');
      return;
    }
    if (detailForm.status === 'COMPLETED' && !canCompleteChecklist) {
      setError('Complete required checklist steps and proof before completing the assignment.');
      return;
    }
    if (detailForm.status === 'COMPLETED' && !canCompleteWorkLogs) {
      setError('Add at least one completed work log and resolve in-progress/follow-up logs before completing the assignment.');
      return;
    }
    setSavingSection(editingSection || 'details');
    try {
      const payload = {
        ...detailForm,
        siteId: Number(detailForm.siteId),
        requestId: Number(detailForm.requestId),
        vendorId: Number(detailForm.vendorId),
        assignedEmployeeId: detailForm.assignedEmployeeId ? Number(detailForm.assignedEmployeeId) : null,
        estimatedCost: detailForm.estimatedCost === '' ? null : Number(detailForm.estimatedCost),
        actualCost: detailForm.actualCost === '' ? null : Number(detailForm.actualCost),
      };
      await updateMaintenanceAssignment(id, payload);
      await loadAssignment();
      setEditingSection('');
    } catch (err) {
      setError(formatApiError(err, 'Unable to save assignment.'));
    } finally {
      setSavingSection('');
    }
  };

  const handleAddChecklistItem = async () => {
    setError('');
    if (!checklistForm.taskTitle.trim()) {
      setError('Checklist task title is required.');
      return;
    }
    try {
      await addAssignmentChecklistItem(id, {
        ...checklistForm,
        sequenceNumber: checklistRows.length + 1,
        taskTitle: checklistForm.taskTitle.trim(),
      });
      setChecklistForm(initialChecklistForm);
      loadChecklist();
    } catch (err) {
      setError(formatApiError(err, 'Unable to add checklist item.'));
    }
  };

  const handleSaveChecklistRow = async (row) => {
    setError('');
    try {
      await updateAssignmentChecklistItem(id, row.id, row);
      loadChecklist();
    } catch (err) {
      setError(formatApiError(err, 'Unable to update checklist item.'));
    }
  };

  const handleDeleteChecklistRow = async (row) => {
    if (!(await requestConfirmation('Remove checklist item?', 'This checklist item will be removed from the assignment.'))) return;
    try {
      await deleteAssignmentChecklistItem(id, row.id);
      loadChecklist();
    } catch (err) {
      setError(formatApiError(err, 'Unable to remove checklist item.'));
    }
  };

  const handleUploadChecklistProof = async (row, file) => {
    if (!file) return;
    setError('');
    try {
      await uploadAssignmentChecklistProof(id, row.id, file);
      loadChecklist();
    } catch (err) {
      setError(formatApiError(err, 'Unable to upload checklist proof.'));
    }
  };

  const handleDownloadProof = async (row, proof) => {
    try {
      const response = await downloadAssignmentChecklistProof(id, row.id, proof.id);
      downloadBlob(response, proof.originalFileName || 'proof');
    } catch (err) {
      setError(formatApiError(err, 'Unable to download checklist proof.'));
    }
  };

  const handleDeleteChecklistProof = async (row, proof) => {
    if (!(await requestConfirmation('Remove proof file?', `This will remove ${proof.originalFileName || 'the selected proof file'}.`))) return;
    try {
      await deleteAssignmentChecklistProof(id, row.id, proof.id);
      loadChecklist();
    } catch (err) {
      setError(formatApiError(err, 'Unable to delete checklist proof.'));
    }
  };

  const resetWorkLogForm = () => {
    setEditingWorkLogId(null);
    setWorkLogForm(initialWorkLogForm);
  };

  const handleSaveWorkLog = async () => {
    setError('');
    if (!workLogForm.technicianEmployeeId || !workLogForm.startTime) {
      setError('Technician and start time are required.');
      return;
    }
    if (workLogForm.completionStatus === 'COMPLETED' && !workLogForm.endTime) {
      setError('End time is required when work log is completed.');
      return;
    }
    try {
      const payload = {
        ...workLogForm,
        technicianEmployeeId: Number(workLogForm.technicianEmployeeId),
        startTime: toApiDateTime(workLogForm.startTime),
        endTime: toApiDateTime(workLogForm.endTime),
      };
      if (editingWorkLogId) {
        await updateAssignmentWorkLog(id, editingWorkLogId, payload);
      } else {
        await addAssignmentWorkLog(id, payload);
      }
      resetWorkLogForm();
      loadWorkLogs();
    } catch (err) {
      setError(formatApiError(err, 'Unable to save technician work log.'));
    }
  };

  const handleEditWorkLog = (row) => {
    setEditingWorkLogId(row.id);
    setWorkLogForm({
      technicianEmployeeId: row.technicianEmployeeId || '',
      startTime: toDateTimeInput(row.startTime),
      endTime: toDateTimeInput(row.endTime),
      workNotes: row.workNotes || '',
      issueFound: row.issueFound || '',
      actionTaken: row.actionTaken || '',
      completionStatus: row.completionStatus || 'IN_PROGRESS',
    });
  };

  const handleDeleteWorkLog = async (row) => {
    if (!(await requestConfirmation('Remove work log?', 'This technician work log will be removed from the assignment.'))) return;
    try {
      await deleteAssignmentWorkLog(id, row.id);
      if (editingWorkLogId === row.id) resetWorkLogForm();
      loadWorkLogs();
    } catch (err) {
      setError(formatApiError(err, 'Unable to remove technician work log.'));
    }
  };

  const handleUploadWorkLogAttachment = async (row, file) => {
    if (!file) return;
    setError('');
    try {
      await uploadAssignmentWorkLogAttachment(id, row.id, file);
      loadWorkLogs();
    } catch (err) {
      setError(formatApiError(err, 'Unable to upload work log attachment.'));
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

  const handleDeleteWorkLogAttachment = async (row, attachment) => {
    if (!(await requestConfirmation('Remove attachment?', `This will remove ${attachment.originalFileName || 'the selected attachment'}.`))) return;
    try {
      await deleteAssignmentWorkLogAttachment(id, row.id, attachment.id);
      loadWorkLogs();
    } catch (err) {
      setError(formatApiError(err, 'Unable to delete work log attachment.'));
    }
  };

  const handleAddSpare = async () => {
    setError('');
    if (!spareForm.stockId || !spareForm.quantityUsed) {
      setError('Spare part and quantity are required.');
      return;
    }
    try {
      await addAssignmentSpare(id, {
        stockId: Number(spareForm.stockId),
        requestedQty: Number(spareForm.quantityUsed),
        quantityUsed: Number(spareForm.quantityUsed),
        remarks: spareForm.remarks,
      });
      setSpareForm({ stockId: '', quantityUsed: '', remarks: '' });
      loadSpares();
    } catch (err) {
      setError(formatApiError(err, 'Unable to request spare part.'));
    }
  };

  const handleDeleteSpare = async (usageId) => {
    if (!(await requestConfirmation('Remove spare request?', 'This spare request will be removed from the assignment.'))) return;
    try {
      await deleteAssignmentSpare(id, usageId);
      loadSpares();
      if (detailForm.siteId) getSparePartsBySite(detailForm.siteId).then((data) => setSiteSpares(data || []));
    } catch (err) {
      setError(formatApiError(err, 'Unable to remove spare usage.'));
    }
  };

  const handleOpenEditSpare = (row) => {
    setSpareEditDialog({ open: true, row, quantityUsed: row.quantityUsed ?? '', remarks: row.remarks || '' });
  };

  const refreshSiteSpares = React.useCallback(() => {
    if (detailForm.siteId) {
      getSparePartsBySite(detailForm.siteId).then((data) => setSiteSpares(data || []));
    }
  }, [detailForm.siteId]);

  const handleUpdateSpare = async () => {
    setError('');
    try {
      await updateAssignmentSpare(id, spareEditDialog.row.id, {
        stockId: spareEditDialog.row.stockId,
        quantityUsed: Number(spareEditDialog.quantityUsed),
        remarks: spareEditDialog.remarks,
      });
      setSpareEditDialog(initialSpareEditDialog);
      loadSpares();
      refreshSiteSpares();
    } catch (err) {
      setError(formatApiError(err, 'Unable to update spare request.'));
    }
  };

  const handleSpareAction = async (row, action) => {
    const labels = {
      reserve: 'reserve this spare request',
      issue: 'issue this spare',
      consume: 'mark this spare as consumed',
      reject: 'reject this spare request',
      cancel: 'cancel this spare request',
      return: 'return this issued spare',
    };
    if (!(await requestConfirmation('Update spare request?', `Confirm ${labels[action]}?`))) return;
    setError('');
    try {
      const payload = { remarks: row.remarks };
      if (action === 'reserve') await reserveAssignmentSpare(id, row.id, payload);
      if (action === 'issue') await issueAssignmentSpare(id, row.id, payload);
      if (action === 'consume') await consumeAssignmentSpare(id, row.id, payload);
      if (action === 'reject') await rejectAssignmentSpare(id, row.id, payload);
      if (action === 'cancel') await cancelAssignmentSpare(id, row.id, payload);
      if (action === 'return') await returnAssignmentSpare(id, row.id, payload);
      loadSpares();
      refreshSiteSpares();
    } catch (err) {
      setError(formatApiError(err, 'Unable to update spare request status.'));
    }
  };

  const siteOptions = React.useMemo(() => sites.map((site) => ({ value: site.id, label: `${site.siteName} (${site.siteCode})` })), [sites]);
  const requestOptions = React.useMemo(() => requests.map((request) => ({ value: request.id, label: `${request.requestNumber} - ${request.title}` })), [requests]);
  const vendorOptions = React.useMemo(() => vendors.map((vendor) => ({ value: vendor.id, label: vendor.vendorName })), [vendors]);
  const employeeOptions = React.useMemo(() => [
    ...manualTechnicianOptions,
    ...(detailForm.assignedEmployeeId && !employees.some((employee) => String(employee.id) === String(detailForm.assignedEmployeeId))
      ? [{ value: detailForm.assignedEmployeeId, label: detailForm.assignedEmployeeName || detailForm.assignedTo }]
      : []),
    ...employees.map((employee) => ({ value: employee.id, label: employeeLabel(employee) })),
  ], [detailForm.assignedEmployeeId, detailForm.assignedEmployeeName, detailForm.assignedTo, employees]);
  const workLogTechnicianOptions = React.useMemo(() => [
    ...(detailForm.assignedEmployeeId && !employees.some((employee) => String(employee.id) === String(detailForm.assignedEmployeeId))
      ? [{ value: detailForm.assignedEmployeeId, label: detailForm.assignedEmployeeName || detailForm.assignedTo }]
      : []),
    ...employees.map((employee) => ({ value: employee.id, label: employeeLabel(employee) })),
  ], [detailForm.assignedEmployeeId, detailForm.assignedEmployeeName, detailForm.assignedTo, employees]);
  const sparePartOptions = React.useMemo(() => {
    const recommendedStockIds = new Set(recommendedSpareBom.map((row) => String(row.stockId)));
    const recommendedOptions = recommendedSpareBom.map((row) => ({
      value: row.stockId,
      label: `Recommended: ${row.partCode} - ${row.partName} | Qty: ${row.recommendedQty} ${row.unit || ''} | Available: ${row.availableStock ?? '-'}`,
    }));
    const otherOptions = siteSpares
      .filter((item) => !recommendedStockIds.has(String(item.id)))
      .map((item) => ({
        value: item.id,
        label: `${item.partCode} - ${item.partName} | Available: ${item.availableStock ?? item.currentStock} ${item.unit}`,
      }));
    return [...recommendedOptions, ...otherOptions];
  }, [recommendedSpareBom, siteSpares]);
  const assignmentStatusOptions = React.useMemo(() => {
    const completedDisabledReasons = [];
    if (checklistRows.length > 0 && !canCompleteChecklist) {
      completedDisabledReasons.push('Complete all required checklist items and attach required proof.');
    }
    if (!canCompleteWorkLogs) {
      completedDisabledReasons.push('Add at least one completed work log and close in-progress or follow-up work logs.');
    }
    const completedDisabled = completedDisabledReasons.length > 0;

    return assignmentStatusBaseOptions.map((option) => (
      option.value === 'COMPLETED'
        ? {
          ...option,
          disabled: completedDisabled,
          disabledReason: completedDisabled ? completedDisabledReasons.join(' ') : '',
        }
        : option
    ));
  }, [canCompleteChecklist, canCompleteWorkLogs, checklistRows.length]);

  const canEditMain = hasPermission('ASSIGNMENT_UPDATE');
  const canEditChecklist = hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') || hasPermission('ASSIGNMENT_CHECKLIST_PROOF_UPLOAD') || hasPermission('ASSIGNMENT_CHECKLIST_PROOF_DELETE');
  const canEditWorkLogs = hasPermission('ASSIGNMENT_WORK_LOG_CREATE') || hasPermission('ASSIGNMENT_WORK_LOG_UPDATE') || hasPermission('ASSIGNMENT_WORK_LOG_DELETE') || hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD') || hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE');
  const canEditSpares = hasPermission('SPARE_USAGE_UPDATE') || hasPermission('SPARE_USAGE_RESERVE') || hasPermission('SPARE_USAGE_ISSUE') || hasPermission('SPARE_USAGE_CONSUME') || hasPermission('SPARE_USAGE_REJECT') || hasPermission('SPARE_USAGE_CANCEL') || hasPermission('SPARE_USAGE_RETURN') || hasPermission('SPARE_USAGE_DELETE');
  const isEditingMain = editingSection === 'main';
  const isEditingDetails = editingSection === 'details';
  const isEditingChecklist = editingSection === 'checklist';
  const isEditingWorkLogs = editingSection === 'workLogs';
  const isEditingSpares = editingSection === 'spares';

  const sectionEditButton = (section, label, canEdit = canEditMain) => (
    canEdit && editingSection !== section ? (
      <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => startEditing(section)}>
        {label}
      </Button>
    ) : null
  );

  const sectionActions = (section, label, canEdit = true) => {
    if (editingSection === section) {
      return (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={stopEditing}>Done</Button>
        </Stack>
      );
    }
    return sectionEditButton(section, label, canEdit);
  };

  const assignmentSectionActions = (section, label) => (
    editingSection === section ? (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={stopEditing}>Cancel</Button>
        <Button size="small" variant="contained" startIcon={<Save />} disabled={Boolean(savingSection)} onClick={handleSaveAssignmentSection}>
          {savingSection ? 'Saving...' : 'Save'}
        </Button>
      </Stack>
    ) : sectionEditButton(section, label, canEditMain)
  );

  const editableSpareColumns = React.useMemo(() => [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.2 },
    { field: 'requestedQty', headerName: 'Requested', minWidth: 110, flex: 0.5, valueGetter: ({ row }) => row.requestedQty ?? row.quantityUsed },
    { field: 'approvedQty', headerName: 'Approved', minWidth: 110, flex: 0.5 },
    { field: 'issuedQty', headerName: 'Issued', minWidth: 95, flex: 0.45 },
    { field: 'consumedQty', headerName: 'Consumed', minWidth: 110, flex: 0.5 },
    { field: 'returnedQty', headerName: 'Returned', minWidth: 110, flex: 0.5 },
    { field: 'unit', headerName: 'Unit', minWidth: 90, flex: 0.4 },
    { field: 'availableStock', headerName: 'Available', minWidth: 110, flex: 0.55 },
    { field: 'unitCost', headerName: 'Unit Cost', minWidth: 120, flex: 0.6 },
    { field: 'totalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7, valueFormatter: ({ value }) => value == null ? '-' : formatMoney(value) },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 180,
      flex: 0.85,
      renderCell: ({ row }) => {
        const status = row.status || 'CONSUMED';
        return <Chip size="small" label={formatLabel(status)} color={spareStatusColors[status] || 'default'} />;
      },
    },
    { field: 'purchaseRequestId', headerName: 'Purchase', minWidth: 120, flex: 0.55, valueGetter: ({ row }) => row.purchaseRequestId ? `#${row.purchaseRequestId}` : '' },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1, valueGetter: ({ value }) => value || '-' },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: isEditingSpares ? 280 : 0,
      renderCell: ({ row }) => {
        if (!isEditingSpares) return null;
        const rowStatus = row.status || 'CONSUMED';
        return (
          <Stack direction="row" spacing={0.25}>
            {rowStatus === 'REQUESTED' && hasPermission('SPARE_USAGE_UPDATE') && (
              <Tooltip title="Edit"><IconButton aria-label="Edit spare request" onClick={() => handleOpenEditSpare(row)}><Edit fontSize="small" /></IconButton></Tooltip>
            )}
            {['STOCK_AVAILABLE', 'PURCHASE_RECEIVED'].includes(rowStatus) && hasPermission('SPARE_USAGE_RESERVE') && (
              <Tooltip title="Reserve"><IconButton aria-label="Reserve spare" color="primary" onClick={() => handleSpareAction(row, 'reserve')}><CheckCircle fontSize="small" /></IconButton></Tooltip>
            )}
            {rowStatus === 'REQUESTED' && hasPermission('SPARE_USAGE_REJECT') && (
              <Tooltip title="Reject"><IconButton aria-label="Reject spare" color="error" onClick={() => handleSpareAction(row, 'reject')}><Cancel fontSize="small" /></IconButton></Tooltip>
            )}
            {['REQUESTED', 'MANAGER_APPROVED', 'STOCK_AVAILABLE', 'STOCK_NOT_AVAILABLE', 'PURCHASE_REQUESTED', 'RESERVED'].includes(rowStatus) && hasPermission('SPARE_USAGE_CANCEL') && (
              <Tooltip title="Cancel"><IconButton aria-label="Cancel spare request" onClick={() => handleSpareAction(row, 'cancel')}><Delete fontSize="small" /></IconButton></Tooltip>
            )}
            {['STOCK_AVAILABLE', 'PURCHASE_RECEIVED', 'RESERVED'].includes(rowStatus) && hasPermission('SPARE_USAGE_ISSUE') && (
              <Tooltip title="Issue"><IconButton aria-label="Issue spare" color="primary" onClick={() => handleSpareAction(row, 'issue')}><Inventory fontSize="small" /></IconButton></Tooltip>
            )}
            {['ISSUED', 'PARTIALLY_CONSUMED'].includes(rowStatus) && hasPermission('SPARE_USAGE_CONSUME') && (
              <Tooltip title="Consume"><IconButton aria-label="Consume spare" color="success" onClick={() => handleSpareAction(row, 'consume')}><CheckCircle fontSize="small" /></IconButton></Tooltip>
            )}
            {rowStatus === 'ISSUED' && hasPermission('SPARE_USAGE_RETURN') && (
              <Tooltip title="Return"><IconButton aria-label="Return spare" onClick={() => handleSpareAction(row, 'return')}><Undo fontSize="small" /></IconButton></Tooltip>
            )}
            {['REQUESTED', 'REJECTED', 'CANCELLED', 'RETURNED'].includes(rowStatus) && hasPermission('SPARE_USAGE_DELETE') && (
              <Tooltip title="Delete"><IconButton aria-label="Delete spare request" color="error" onClick={() => handleDeleteSpare(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
            )}
          </Stack>
        );
      },
    },
  ], [hasPermission, isEditingSpares]);

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

  const status = detailForm.status || 'ASSIGNED';

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
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>Assignment Summary</Typography>
          {assignmentSectionActions('main', 'Edit Main')}
        </Stack>
        {isEditingMain ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><CommonDropdown required label="Site" value={detailForm.siteId} onChange={updateSite} options={siteOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonDropdown required disabled={!detailForm.siteId} label="Request" value={detailForm.requestId} onChange={updateRequest} options={requestOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonDropdown required disabled={!detailForm.siteId || !detailForm.requestId} label="Vendor" value={detailForm.vendorId} onChange={updateDetailField('vendorId')} options={vendorOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonDropdown disabled={!detailForm.siteId} label="Assigned Technician" value={detailForm.assignedEmployeeId || ''} onChange={updateAssignedEmployee} options={employeeOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonInput required disabled={Boolean(detailForm.assignedEmployeeId)} label="Assigned To" value={detailForm.assignedTo || ''} onChange={updateDetailField('assignedTo')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker label="Assigned Date" value={detailForm.assignedDate || ''} onChange={updateDetailField('assignedDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker label="Planned Start" value={detailForm.plannedStartDate || ''} onChange={updateDetailField('plannedStartDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker label="Planned End" value={detailForm.plannedEndDate || ''} onChange={updateDetailField('plannedEndDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDropdown label="Status" value={detailForm.status || 'ASSIGNED'} onChange={updateDetailField('status')} options={assignmentStatusOptions} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker label="Actual Start" value={detailForm.actualStartDate || ''} onChange={updateDetailField('actualStartDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker label="Actual End" value={detailForm.actualEndDate || ''} onChange={updateDetailField('actualEndDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput type="number" label="Estimated Cost" value={detailForm.estimatedCost} onChange={updateDetailField('estimatedCost')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput type="number" label="Service/Vendor Cost" value={detailForm.actualCost} onChange={updateDetailField('actualCost')} /></Grid>
          </Grid>
        ) : (
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
        )}
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
        <SectionShell title="Request Details" action={assignmentSectionActions('details', 'Edit Details')}>
          {isEditingDetails ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><CommonDropdown required disabled={!detailForm.siteId} label="Request" value={detailForm.requestId} onChange={updateRequest} options={requestOptions} /></Grid>
              <Grid item xs={12} md={4}><CommonDropdown label="Status" value={detailForm.status || 'ASSIGNED'} onChange={updateDetailField('status')} options={assignmentStatusOptions} /></Grid>
              <Grid item xs={12} md={4}><CommonInput disabled label="Priority" value={assignment.requestPriority || assignment.priority || '-'} /></Grid>
              <Grid item xs={12}><CommonTextArea minRows={2} label="Remarks" value={detailForm.remarks || ''} onChange={updateDetailField('remarks')} /></Grid>
            </Grid>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}><DetailItem label="Request Number" value={assignment.requestNumber} /></Grid>
              <Grid item xs={12} md={4}><DetailItem label="Request Status" value={formatLabel(assignment.requestStatus)} /></Grid>
              <Grid item xs={12} md={4}><DetailItem label="Priority" value={formatLabel(assignment.requestPriority || assignment.priority)} /></Grid>
              <Grid item xs={12}><DetailItem label="Remarks" value={assignment.remarks} /></Grid>
            </Grid>
          )}
        </SectionShell>
      )}

      {tab === 1 && (
        <SectionShell
          title="Checklist"
          action={(
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={`${checklistProgress}%`} color={checklistProgress === 100 && checklistRows.length ? 'success' : 'warning'} />
              {sectionActions('checklist', 'Edit Checklist', canEditChecklist)}
            </Stack>
          )}
        >
          {sectionLoading.checklist && <LinearProgress sx={{ mb: 2 }} />}
          <LinearProgress variant="determinate" value={checklistProgress} sx={{ mb: 2 }} />
          {isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><CommonInput label="Task" value={checklistForm.taskTitle} onChange={updateChecklistForm('taskTitle')} /></Grid>
              <Grid item xs={12} md={3}><CommonInput label="Instructions" value={checklistForm.instructions} onChange={updateChecklistForm('instructions')} /></Grid>
              <Grid item xs={12} md={2}><CommonDropdown label="Response" value={checklistForm.responseType} onChange={updateChecklistForm('responseType')} options={checklistResponseOptions} /></Grid>
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button variant={checklistForm.required ? 'contained' : 'outlined'} onClick={() => setChecklistForm((current) => ({ ...current, required: !current.required }))}>Required</Button>
                  <Button variant={checklistForm.proofRequired ? 'contained' : 'outlined'} onClick={() => setChecklistForm((current) => ({ ...current, proofRequired: !current.proofRequired }))}>Proof</Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" startIcon={<AddTask />} sx={{ height: '100%' }} onClick={handleAddChecklistItem}>Add Step</Button></Grid>
            </Grid>
          )}
          <Stack spacing={1.5}>
            {checklistRows.length === 0 && <Typography variant="body2" color="text.secondary">No checklist items.</Typography>}
            {checklistRows.map((row) => (
              <Box key={row.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={isEditingChecklist ? 2.5 : 4}>
                    <Typography variant="subtitle2" fontWeight={800}>{row.sequenceNumber}. {row.taskTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatLabel(row.responseType)}{row.required !== false ? ' | Required' : ''}{row.proofRequired ? ' | Proof' : ''}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    {isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') ? (
                      <CommonDropdown size="small" label="Status" value={row.status || 'PENDING'} onChange={(event) => updateChecklistRow(row.id, 'status', event.target.value)} options={checklistStatusDropdownOptions} />
                    ) : (
                      <Chip size="small" label={formatLabel(row.status || 'PENDING')} color={['COMPLETED', 'NOT_APPLICABLE'].includes(row.status) ? 'success' : 'warning'} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={isEditingChecklist ? 2 : 3}>
                    {isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') ? (
                      <CommonInput size="small" label={row.responseType === 'NUMBER' ? 'Reading' : 'Response'} value={row.responseValue || ''} onChange={(event) => updateChecklistRow(row.id, 'responseValue', event.target.value)} />
                    ) : (
                      <DetailItem label="Response" value={row.responseValue} />
                    )}
                  </Grid>
                  <Grid item xs={12} md={isEditingChecklist ? 2.5 : 3}>
                    {isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') ? (
                      <CommonInput size="small" label="Remarks" value={row.remarks || ''} onChange={(event) => updateChecklistRow(row.id, 'remarks', event.target.value)} />
                    ) : (
                      <DetailItem label="Remarks" value={row.remarks} />
                    )}
                  </Grid>
                  {isEditingChecklist && (
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                        {hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && <Tooltip title="Save"><IconButton color="primary" onClick={() => handleSaveChecklistRow(row)}><Save fontSize="small" /></IconButton></Tooltip>}
                        {hasPermission('ASSIGNMENT_CHECKLIST_PROOF_UPLOAD') && (
                          <Tooltip title="Upload proof">
                            <IconButton component="label" color={row.proofRequired ? 'primary' : 'default'}>
                              <UploadFile fontSize="small" />
                              <input type="file" hidden onChange={(event) => handleUploadChecklistProof(row, event.target.files?.[0])} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && !row.sourcePmChecklistItemId && <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDeleteChecklistRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
                      </Stack>
                    </Grid>
                  )}
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
                            onDelete={isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_PROOF_DELETE') ? () => handleDeleteChecklistProof(row, proof) : undefined}
                            deleteIcon={isEditingChecklist && hasPermission('ASSIGNMENT_CHECKLIST_PROOF_DELETE') ? <Delete /> : undefined}
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
          action={(
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={`${workLogProgress}% completed`} color={workLogProgress === 100 && workLogRows.length ? 'success' : 'warning'} />
              {sectionActions('workLogs', 'Edit Work Logs', canEditWorkLogs)}
            </Stack>
          )}
        >
          {sectionLoading.workLogs && <LinearProgress sx={{ mb: 2 }} />}
          {isEditingWorkLogs && (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><CommonDropdown required label="Technician" value={workLogForm.technicianEmployeeId} onChange={updateWorkLogForm('technicianEmployeeId')} options={workLogTechnicianOptions} /></Grid>
              <Grid item xs={12} md={2}><CommonDateTimePicker required label="Start Time" value={workLogForm.startTime} onChange={updateWorkLogForm('startTime')} /></Grid>
              <Grid item xs={12} md={2}><CommonDateTimePicker label="End Time" value={workLogForm.endTime} onChange={updateWorkLogForm('endTime')} /></Grid>
              <Grid item xs={12} md={2}><CommonDropdown label="Status" value={workLogForm.completionStatus} onChange={updateWorkLogForm('completionStatus')} options={workLogStatusDropdownOptions} /></Grid>
              <Grid item xs={12} md={3}><CommonInput label="Work Notes" value={workLogForm.workNotes} onChange={updateWorkLogForm('workNotes')} /></Grid>
              <Grid item xs={12} md={4}><CommonInput label="Issue Found" value={workLogForm.issueFound} onChange={updateWorkLogForm('issueFound')} /></Grid>
              <Grid item xs={12} md={4}><CommonInput label="Action Taken" value={workLogForm.actionTaken} onChange={updateWorkLogForm('actionTaken')} /></Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} sx={{ height: '100%' }} alignItems="stretch">
                  <Button fullWidth variant="contained" startIcon={<Save />} onClick={handleSaveWorkLog}>{editingWorkLogId ? 'Update Log' : 'Add Log'}</Button>
                  {editingWorkLogId && <Button variant="outlined" onClick={resetWorkLogForm}>Cancel</Button>}
                </Stack>
              </Grid>
            </Grid>
          )}
          <Stack spacing={1.5}>
            {workLogRows.length === 0 && <Typography variant="body2" color="text.secondary">No technician work logs.</Typography>}
            {workLogRows.map((row) => (
              <Box key={row.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="subtitle2" fontWeight={800}>{row.technicianName || row.technicianEmployeeCode}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDateTime(row.startTime)} - {formatDateTime(row.endTime)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={1.5}><Chip size="small" label={formatLabel(row.completionStatus)} color={workLogStatusColors[row.completionStatus] || 'default'} /></Grid>
                  <Grid item xs={12} md={2}><DetailItem label="Issue Found" value={row.issueFound} /></Grid>
                  <Grid item xs={12} md={2}><DetailItem label="Action Taken" value={row.actionTaken} /></Grid>
                  <Grid item xs={12} md={2}><DetailItem label="Work Notes" value={row.workNotes} /></Grid>
                  {isEditingWorkLogs && (
                    <Grid item xs={12} md={2}>
                      <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                        {hasPermission('ASSIGNMENT_WORK_LOG_UPDATE') && <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleEditWorkLog(row)}><Edit fontSize="small" /></IconButton></Tooltip>}
                        {hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD') && (
                          <Tooltip title="Upload attachment">
                            <IconButton component="label">
                              <UploadFile fontSize="small" />
                              <input type="file" hidden onChange={(event) => handleUploadWorkLogAttachment(row, event.target.files?.[0])} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {hasPermission('ASSIGNMENT_WORK_LOG_DELETE') && <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDeleteWorkLog(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
                      </Stack>
                    </Grid>
                  )}
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
                            onDelete={isEditingWorkLogs && hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE') ? () => handleDeleteWorkLogAttachment(row, attachment) : undefined}
                            deleteIcon={isEditingWorkLogs && hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE') ? <Delete /> : undefined}
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
        <SectionShell title="Spare Part Requests" action={sectionActions('spares', 'Edit Spare Parts', canEditSpares)}>
          {sectionLoading.spares && <LinearProgress sx={{ mb: 2 }} />}
          {isEditingSpares && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}><CommonDropdown label="Spare Part" value={spareForm.stockId} onChange={updateSpareStock} options={sparePartOptions} /></Grid>
              <Grid item xs={12} md={2}><CommonInput type="number" label="Quantity" value={spareForm.quantityUsed} onChange={updateSpareField('quantityUsed')} /></Grid>
              <Grid item xs={12} md={3}><CommonInput label="Remarks" value={spareForm.remarks} onChange={updateSpareField('remarks')} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={handleAddSpare}>Request Spare</Button></Grid>
            </Grid>
          )}
          <Box sx={{ height: 420 }}>
            <DataGrid
              rows={spareRows}
              columns={editableSpareColumns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
              localeText={{ noRowsLabel: 'No spare part requests.' }}
            />
          </Box>
        </SectionShell>
      )}

      <Dialog open={spareEditDialog.open} onClose={() => setSpareEditDialog(initialSpareEditDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Spare Request</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {spareEditDialog.row?.partCode} - {spareEditDialog.row?.partName}
          </Typography>
          <CommonInput
            required
            type="number"
            label="Requested Quantity"
            value={spareEditDialog.quantityUsed}
            onChange={(event) => setSpareEditDialog((current) => ({ ...current, quantityUsed: event.target.value }))}
          />
          <CommonTextArea
            minRows={2}
            label="Remarks"
            value={spareEditDialog.remarks}
            onChange={(event) => setSpareEditDialog((current) => ({ ...current, remarks: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpareEditDialog(initialSpareEditDialog)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSpare}>Save</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmDialog.open}
        handleClose={() => closeConfirmation(false)}
        title={confirmDialog.title}
        message={confirmDialog.message}
        handleAgree={() => closeConfirmation(true)}
        closebtn="Cancel"
        agreebtn="Confirm"
        isOuterClick
      />
    </Box>
  );
}

export default MaintenanceAssignmentViewPage;
