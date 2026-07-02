import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Paper, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { AddTask, Cancel, CheckCircle, Delete, Download, Edit, Inventory, Save, Undo, UploadFile } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import { getSites } from '../../site/services/siteService';
import { searchEmployees } from '../../employee/services/employeeService';
import { createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import {
  addAssignmentChecklistItem,
  addAssignmentWorkLog,
  createMaintenanceAssignment,
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
import { getRequestsBySite } from '../../maintenanceRequest/services/maintenanceRequestService';
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
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDateTimePicker from '../../../shared/components/common/CommonDateTimePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';

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
const checklistStatusOptions = ['PENDING', 'COMPLETED', 'NOT_APPLICABLE'];
const checklistResponseTypes = ['CHECKBOX', 'TEXT', 'NUMBER', 'PHOTO'];
const workLogStatusOptions = ['IN_PROGRESS', 'COMPLETED', 'FOLLOW_UP_REQUIRED', 'CANCELLED'];
const statusColors = {
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

function MaintenanceAssignmentFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);
  const [siteSpares, setSiteSpares] = React.useState([]);
  const [spareRows, setSpareRows] = React.useState([]);
  const [spareForm, setSpareForm] = React.useState({ stockId: '', quantityUsed: '', remarks: '' });
  const [spareEditDialog, setSpareEditDialog] = React.useState(initialSpareEditDialog);
  const [checklistRows, setChecklistRows] = React.useState([]);
  const [checklistForm, setChecklistForm] = React.useState(initialChecklistForm);
  const [workLogRows, setWorkLogRows] = React.useState([]);
  const [workLogForm, setWorkLogForm] = React.useState(initialWorkLogForm);
  const [editingWorkLogId, setEditingWorkLogId] = React.useState(null);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState({ open: false, title: '', message: '', resolve: null });
  const [workflowTab, setWorkflowTab] = React.useState(0);

  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getMaintenanceAssignmentById(id)
        .then((data) => setForm({ ...initialForm, ...data, siteId: data.siteId || '', requestId: data.requestId || '', vendorId: data.vendorId || '', assignedEmployeeId: data.assignedEmployeeId || '', estimatedCost: data.estimatedCost ?? '', actualCost: data.actualCost ?? '' }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load assignment.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (!form.siteId) {
      setRequests([]);
      setVendors([]);
      setEmployees([]);
      setSiteSpares([]);
      return;
    }
    const employeePayload = createSearchPayload({
      filters: [equalFilter('siteId', form.siteId, 'NUMBER'), equalFilter('status', 'ACTIVE')],
      paginationModel: { page: 0, pageSize: 200 },
      sortModel: [{ field: 'firstName', sort: 'asc' }],
    });
    Promise.all([getRequestsBySite(form.siteId), getVendorsBySite(form.siteId), getSparePartsBySite(form.siteId), searchEmployees(employeePayload)])
      .then(([requestRows, vendorRows, spareRows, employeeRows]) => {
        setRequests((requestRows || []).filter((request) => !['PENDING_APPROVAL', 'CLOSE_PENDING_APPROVAL', 'REJECTED'].includes(request.status)));
        setVendors(vendorRows || []);
        setSiteSpares(spareRows || []);
        setEmployees(employeeRows?.data || []);
      })
      .catch(() => setError('Unable to load requests, vendors, technicians, or spare parts for selected site.'));
  }, [form.siteId]);

  const loadSpares = React.useCallback(() => {
    if (!id) {
      setSpareRows([]);
      return;
    }
    getAssignmentSpares(id)
      .then((data) => setSpareRows(data || []))
      .catch(() => setError('Unable to load assignment spare usage.'));
  }, [id]);

  React.useEffect(() => { loadSpares(); }, [loadSpares]);

  const loadChecklist = React.useCallback(() => {
    if (!id) {
      setChecklistRows([]);
      return;
    }
    getAssignmentChecklist(id)
      .then((data) => setChecklistRows(data || []))
      .catch(() => setError('Unable to load assignment checklist.'));
  }, [id]);

  React.useEffect(() => { loadChecklist(); }, [loadChecklist]);

  const loadWorkLogs = React.useCallback(() => {
    if (!id) {
      setWorkLogRows([]);
      return;
    }
    getAssignmentWorkLogs(id)
      .then((data) => setWorkLogRows(data || []))
      .catch(() => setError('Unable to load technician work logs.'));
  }, [id]);

  React.useEffect(() => { loadWorkLogs(); }, [loadWorkLogs]);

  React.useEffect(() => {
    if (!editingWorkLogId && form.assignedEmployeeId && !workLogForm.technicianEmployeeId) {
      setWorkLogForm((current) => ({ ...current, technicianEmployeeId: form.assignedEmployeeId }));
    }
  }, [editingWorkLogId, form.assignedEmployeeId, workLogForm.technicianEmployeeId]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, requestId: '', vendorId: '' }));
  const updateRequest = (event) => setForm((current) => ({ ...current, requestId: event.target.value, vendorId: '' }));
  const updateSpareField = (field) => (event) => setSpareForm((current) => ({ ...current, [field]: event.target.value }));
  const updateChecklistForm = (field) => (event) => setChecklistForm((current) => ({ ...current, [field]: event.target.value }));
  const updateWorkLogForm = (field) => (event) => setWorkLogForm((current) => ({ ...current, [field]: event.target.value }));
  const updateAssignedEmployee = (event) => {
    const employeeId = event.target.value;
    const selected = employees.find((employee) => String(employee.id) === String(employeeId));
    setForm((current) => ({
      ...current,
      assignedEmployeeId: employeeId,
      assignedTo: selected ? `${selected.firstName || ''} ${selected.lastName || ''}`.trim() : current.assignedTo,
    }));
  };
  const updateChecklistRow = (rowId, field, value) => {
    setChecklistRows((current) => current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
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

  const materialCost = spareRows
    .filter((item) => ['CONSUMED', 'RETURNED', 'PARTIALLY_CONSUMED'].includes(item.status || 'CONSUMED'))
    .reduce((sum, item) => sum + (Number(item.consumedQty || item.quantityUsed || 0) * Number(item.unitCost || 0)), 0);
  const serviceCost = Number(form.actualCost || 0);
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

  const handleAddChecklistItem = async () => {
    setError('');
    if (!id) {
      setError('Save the assignment before adding checklist steps.');
      return;
    }
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
      setError(err.response?.data?.message || 'Unable to add checklist item.');
    }
  };

  const handleSaveChecklistRow = async (row) => {
    setError('');
    try {
      await updateAssignmentChecklistItem(id, row.id, row);
      loadChecklist();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update checklist item.');
    }
  };

  const handleDeleteChecklistRow = async (row) => {
    if (!(await requestConfirmation('Remove checklist item?', 'This checklist item will be removed from the assignment.'))) return;
    try {
      await deleteAssignmentChecklistItem(id, row.id);
      loadChecklist();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove checklist item.');
    }
  };

  const handleUploadChecklistProof = async (row, file) => {
    if (!file) return;
    setError('');
    try {
      await uploadAssignmentChecklistProof(id, row.id, file);
      loadChecklist();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload checklist proof.');
    }
  };

  const handleDownloadChecklistProof = async (row, proof) => {
    try {
      const response = await downloadAssignmentChecklistProof(id, row.id, proof.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = proof.originalFileName || 'proof';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download checklist proof.');
    }
  };

  const handleDeleteChecklistProof = async (row, proof) => {
    if (!(await requestConfirmation('Remove proof file?', `This will remove ${proof.originalFileName || 'the selected proof file'}.`))) return;
    try {
      await deleteAssignmentChecklistProof(id, row.id, proof.id);
      loadChecklist();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete checklist proof.');
    }
  };

  const resetWorkLogForm = () => {
    setEditingWorkLogId(null);
    setWorkLogForm(initialWorkLogForm);
  };

  const handleSaveWorkLog = async () => {
    setError('');
    if (!id) {
      setError('Save the assignment before adding technician work logs.');
      return;
    }
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
      setError(err.response?.data?.message || 'Unable to save technician work log.');
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
      if (editingWorkLogId === row.id) {
        resetWorkLogForm();
      }
      loadWorkLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove technician work log.');
    }
  };

  const handleUploadWorkLogAttachment = async (row, file) => {
    if (!file) return;
    setError('');
    try {
      await uploadAssignmentWorkLogAttachment(id, row.id, file);
      loadWorkLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload work log attachment.');
    }
  };

  const handleDownloadWorkLogAttachment = async (row, attachment) => {
    try {
      const response = await downloadAssignmentWorkLogAttachment(id, row.id, attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalFileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to download work log attachment.');
    }
  };

  const handleDeleteWorkLogAttachment = async (row, attachment) => {
    if (!(await requestConfirmation('Remove attachment?', `This will remove ${attachment.originalFileName || 'the selected attachment'}.`))) return;
    try {
      await deleteAssignmentWorkLogAttachment(id, row.id, attachment.id);
      loadWorkLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete work log attachment.');
    }
  };

  const handleAddSpare = async () => {
    setError('');
    if (!id) {
      setError('Save the assignment before adding spare parts.');
      return;
    }
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
      setError(err.response?.data?.message || 'Unable to request spare part.');
    }
  };

  const handleDeleteSpare = async (usageId) => {
    if (!(await requestConfirmation('Remove spare request?', 'This spare request will be removed from the assignment.'))) return;
    try {
      await deleteAssignmentSpare(id, usageId);
      loadSpares();
      if (form.siteId) {
        getSparePartsBySite(form.siteId).then((data) => setSiteSpares(data || []));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove spare usage.');
    }
  };

  const handleOpenEditSpare = (row) => {
    setSpareEditDialog({ open: true, row, quantityUsed: row.quantityUsed ?? '', remarks: row.remarks || '' });
  };

  const refreshSiteSpares = React.useCallback(() => {
    if (form.siteId) {
      getSparePartsBySite(form.siteId).then((data) => setSiteSpares(data || []));
    }
  }, [form.siteId]);

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
      setError(err.response?.data?.message || 'Unable to update spare request.');
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
      setError(err.response?.data?.message || 'Unable to update spare request status.');
    }
  };

  const spareColumns = [
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
    { field: 'totalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 180,
      flex: 0.85,
      renderCell: ({ row }) => {
        const status = row.status || 'CONSUMED';
        return <Chip size="small" label={status.replaceAll('_', ' ')} color={statusColors[status] || 'default'} />;
      },
    },
    { field: 'purchaseRequestId', headerName: 'Purchase', minWidth: 120, flex: 0.55, valueGetter: ({ row }) => row.purchaseRequestId ? `#${row.purchaseRequestId}` : '' },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 280,
      renderCell: ({ row }) => {
        if (isView) return null;
        const status = row.status || 'CONSUMED';
        return (
          <Stack direction="row" spacing={0.25}>
            {status === 'REQUESTED' && hasPermission('SPARE_USAGE_UPDATE') && (
              <Tooltip title="Edit"><IconButton aria-label="Edit spare request" onClick={() => handleOpenEditSpare(row)}><Edit fontSize="small" /></IconButton></Tooltip>
            )}
            {['STOCK_AVAILABLE', 'PURCHASE_RECEIVED'].includes(status) && hasPermission('SPARE_USAGE_RESERVE') && (
              <Tooltip title="Reserve"><IconButton aria-label="Reserve spare" color="primary" onClick={() => handleSpareAction(row, 'reserve')}><CheckCircle fontSize="small" /></IconButton></Tooltip>
            )}
            {status === 'REQUESTED' && hasPermission('SPARE_USAGE_REJECT') && (
              <Tooltip title="Reject"><IconButton aria-label="Reject spare" color="error" onClick={() => handleSpareAction(row, 'reject')}><Cancel fontSize="small" /></IconButton></Tooltip>
            )}
            {['REQUESTED', 'MANAGER_APPROVED', 'STOCK_AVAILABLE', 'STOCK_NOT_AVAILABLE', 'PURCHASE_REQUESTED', 'RESERVED'].includes(status) && hasPermission('SPARE_USAGE_CANCEL') && (
              <Tooltip title="Cancel"><IconButton aria-label="Cancel spare request" onClick={() => handleSpareAction(row, 'cancel')}><Delete fontSize="small" /></IconButton></Tooltip>
            )}
            {['STOCK_AVAILABLE', 'PURCHASE_RECEIVED', 'RESERVED'].includes(status) && hasPermission('SPARE_USAGE_ISSUE') && (
              <Tooltip title="Issue"><IconButton aria-label="Issue spare" color="primary" onClick={() => handleSpareAction(row, 'issue')}><Inventory fontSize="small" /></IconButton></Tooltip>
            )}
            {['ISSUED', 'PARTIALLY_CONSUMED'].includes(status) && hasPermission('SPARE_USAGE_CONSUME') && (
              <Tooltip title="Consume"><IconButton aria-label="Consume spare" color="success" onClick={() => handleSpareAction(row, 'consume')}><CheckCircle fontSize="small" /></IconButton></Tooltip>
            )}
            {status === 'ISSUED' && hasPermission('SPARE_USAGE_RETURN') && (
              <Tooltip title="Return"><IconButton aria-label="Return spare" onClick={() => handleSpareAction(row, 'return')}><Undo fontSize="small" /></IconButton></Tooltip>
            )}
            {['REQUESTED', 'REJECTED', 'CANCELLED', 'RETURNED'].includes(status) && hasPermission('SPARE_USAGE_DELETE') && (
              <Tooltip title="Delete"><IconButton aria-label="Delete spare request" color="error" onClick={() => handleDeleteSpare(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.siteId || !form.requestId || !form.vendorId) {
      setError('Site, maintenance request, and vendor are required.');
      return;
    }
    if (!form.assignedEmployeeId && !String(form.assignedTo || '').trim()) {
      setError('Assigned technician is required.');
      return;
    }
    if (form.status === 'COMPLETED' && !canCompleteChecklist) {
      setError('Complete required checklist steps and proof before completing the assignment.');
      return;
    }
    if (form.status === 'COMPLETED' && !canCompleteWorkLogs) {
      setError('Add at least one completed work log and resolve in-progress/follow-up logs before completing the assignment.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        requestId: Number(form.requestId),
        vendorId: Number(form.vendorId),
        assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null,
        estimatedCost: form.estimatedCost === '' ? null : Number(form.estimatedCost),
        actualCost: form.actualCost === '' ? null : Number(form.actualCost),
      };
      if (isEdit) {
        await updateMaintenanceAssignment(id, payload);
      } else {
        await createMaintenanceAssignment(payload);
      }
      navigate('/maintenance/assignments');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const requestOptions = React.useMemo(() => requests.map((r) => ({ value: r.id, label: `${r.requestNumber} - ${r.title}` })), [requests]);
  const vendorOptions = React.useMemo(() => vendors.map((v) => ({ value: v.id, label: v.vendorName })), [vendors]);
  const employeeOptions = React.useMemo(() => [
    { value: '', label: 'Manual / external technician' },
    ...(form.assignedEmployeeId && !employees.some((e) => String(e.id) === String(form.assignedEmployeeId))
      ? [{ value: form.assignedEmployeeId, label: form.assignedEmployeeName || form.assignedTo }]
      : []),
    ...employees.map((e) => ({ value: e.id, label: employeeLabel(e) })),
  ], [employees, form.assignedEmployeeId, form.assignedEmployeeName, form.assignedTo]);
  const checklistStatusDropdownOptions = React.useMemo(() => checklistStatusOptions.map((status) => ({ value: status, label: status.replaceAll('_', ' ') })), []);
  const checklistResponseOptions = React.useMemo(() => checklistResponseTypes.map((type) => ({ value: type, label: type })), []);
  const workLogStatusDropdownOptions = React.useMemo(() => workLogStatusOptions.map((status) => ({ value: status, label: status.replaceAll('_', ' ') })), []);
  const workLogTechnicianOptions = React.useMemo(() => [
    ...(form.assignedEmployeeId && !employees.some((employee) => String(employee.id) === String(form.assignedEmployeeId))
      ? [{ value: form.assignedEmployeeId, label: form.assignedEmployeeName || form.assignedTo }]
      : []),
    ...employees.map((employee) => ({ value: employee.id, label: employeeLabel(employee) })),
  ], [employees, form.assignedEmployeeId, form.assignedEmployeeName, form.assignedTo]);
  const sparePartOptions = React.useMemo(() => siteSpares.map((item) => ({
    value: item.id,
    label: `${item.partCode} - ${item.partName} | Available: ${item.availableStock ?? item.currentStock} ${item.unit}`,
  })), [siteSpares]);
  const assignmentStatusOptions = React.useMemo(() => [
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    {
      value: 'COMPLETED',
      label: 'Completed',
      disabled: (checklistRows.length > 0 && !canCompleteChecklist) || !canCompleteWorkLogs,
    },
    { value: 'CANCELLED', label: 'Cancelled' },
  ], [checklistRows.length, canCompleteChecklist, canCompleteWorkLogs]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Assignment' : isEdit ? 'Edit Assignment' : 'Add Assignment'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CommonDropdown required disabled={isView} label="Site" value={form.siteId} onChange={updateSite} options={siteOptions} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown
                required
                disabled={isView || !form.siteId}
                label="Request"
                value={form.requestId}
                onChange={updateRequest}
                options={requestOptions}
                helperText={form.siteId && requests.length === 0 ? 'No maintenance requests found for this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown
                required
                disabled={isView || !form.siteId || !form.requestId}
                label="Vendor"
                value={form.vendorId}
                onChange={updateField('vendorId')}
                options={vendorOptions}
                helperText={form.siteId && vendors.length === 0 ? 'No vendors assigned to this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown
                disabled={isView || !form.siteId}
                label="Assigned Technician"
                value={form.assignedEmployeeId || ''}
                onChange={updateAssignedEmployee}
                options={employeeOptions}
                helperText={form.siteId && employees.length === 0 ? 'No active employees found for this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}><CommonInput required disabled={isView || Boolean(form.assignedEmployeeId)} label="Assigned To" value={form.assignedTo || ''} onChange={updateField('assignedTo')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Assigned Date" value={form.assignedDate || ''} onChange={updateField('assignedDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Planned Start" value={form.plannedStartDate || ''} onChange={updateField('plannedStartDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Planned End" value={form.plannedEndDate || ''} onChange={updateField('plannedEndDate')} /></Grid>
            <Grid item xs={12} md={3}>
              <CommonDropdown disabled={isView} label="Status" value={form.status || 'ASSIGNED'} onChange={updateField('status')} options={assignmentStatusOptions} />
            </Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Actual Start" value={form.actualStartDate || ''} onChange={updateField('actualStartDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Actual End" value={form.actualEndDate || ''} onChange={updateField('actualEndDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Estimated Cost" value={form.estimatedCost} onChange={updateField('estimatedCost')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Service/Vendor Cost" value={form.actualCost} onChange={updateField('actualCost')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput disabled label="Material Cost" value={materialCost.toFixed(2)} /></Grid>
            <Grid item xs={12} md={3}><CommonInput disabled label="Total Actual Cost" value={totalActualCost.toFixed(2)} /></Grid>
            <Grid item xs={12}><CommonTextArea disabled={isView} minRows={2} label="Remarks" value={form.remarks || ''} onChange={updateField('remarks')} /></Grid>
          </Grid>
          <CommonFormActions
            saving={saving}
            showSave={!isView}
            onCancel={() => navigate('/maintenance/assignments')}
            cancelLabel={isView ? 'Back' : 'Cancel'}
          />
        </Paper>
      </Box>
      {id && (
        <Paper sx={{ borderRadius: 1, mt: 2 }}>
          <Tabs value={workflowTab} onChange={(event, nextTab) => setWorkflowTab(nextTab)} variant="scrollable" scrollButtons="auto">
            <Tab label={`Checklist (${completedChecklistCount}/${checklistRows.length})`} />
            <Tab label={`Work Logs (${completedWorkLogCount}/${workLogRows.length})`} />
            <Tab label={`Spare Parts (${spareRows.length})`} />
          </Tabs>
        </Paper>
      )}
      {id && workflowTab === 0 && (
        <Paper sx={{ p: 3, borderRadius: 1, mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800}>Checklist</Typography>
              <Chip size="small" label={`${completedChecklistCount}/${checklistRows.length}`} color={canCompleteChecklist ? 'success' : 'warning'} />
              <Chip size="small" label={`${checklistProgress}%`} color={checklistProgress === 100 && checklistRows.length ? 'success' : 'warning'} variant="outlined" />
            </Stack>
          </Stack>
          <LinearProgress variant="determinate" value={checklistProgress} sx={{ mb: 2 }} />
          {!isView && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><CommonInput label="Task" value={checklistForm.taskTitle} onChange={updateChecklistForm('taskTitle')} /></Grid>
              <Grid item xs={12} md={3}><CommonInput label="Instructions" value={checklistForm.instructions} onChange={updateChecklistForm('instructions')} /></Grid>
              <Grid item xs={12} md={2}>
                <CommonDropdown label="Response" value={checklistForm.responseType} onChange={updateChecklistForm('responseType')} options={checklistResponseOptions} />
              </Grid>
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
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="subtitle2" fontWeight={800}>{row.sequenceNumber}. {row.taskTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.responseType}{row.required !== false ? ' | Required' : ''}{row.proofRequired ? ' | Proof' : ''}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <CommonDropdown size="small" disabled={isView || !hasPermission('ASSIGNMENT_CHECKLIST_UPDATE')} label="Status" value={row.status || 'PENDING'} onChange={(event) => updateChecklistRow(row.id, 'status', event.target.value)} options={checklistStatusDropdownOptions} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <CommonInput size="small" disabled={isView || !hasPermission('ASSIGNMENT_CHECKLIST_UPDATE')} label={row.responseType === 'NUMBER' ? 'Reading' : 'Response'} value={row.responseValue || ''} onChange={(event) => updateChecklistRow(row.id, 'responseValue', event.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <CommonInput size="small" disabled={isView || !hasPermission('ASSIGNMENT_CHECKLIST_UPDATE')} label="Remarks" value={row.remarks || ''} onChange={(event) => updateChecklistRow(row.id, 'remarks', event.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                      {!isView && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && (
                        <Tooltip title="Save"><IconButton color="primary" onClick={() => handleSaveChecklistRow(row)}><Save fontSize="small" /></IconButton></Tooltip>
                      )}
                      {!isView && hasPermission('ASSIGNMENT_CHECKLIST_PROOF_UPLOAD') && (
                        <Tooltip title="Upload proof">
                          <IconButton component="label" color={row.proofRequired ? 'primary' : 'default'}>
                            <UploadFile fontSize="small" />
                            <input type="file" hidden onChange={(event) => handleUploadChecklistProof(row, event.target.files?.[0])} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!isView && hasPermission('ASSIGNMENT_CHECKLIST_UPDATE') && !row.sourcePmChecklistItemId && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDeleteChecklistRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>
                      )}
                    </Stack>
                  </Grid>
                  {row.completedAt && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Completed {new Date(row.completedAt).toLocaleString()} {row.completedByName ? `by ${row.completedByName}` : ''}
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
                            onClick={() => handleDownloadChecklistProof(row, proof)}
                            onDelete={!isView && hasPermission('ASSIGNMENT_CHECKLIST_PROOF_DELETE') ? () => handleDeleteChecklistProof(row, proof) : undefined}
                            deleteIcon={!isView && hasPermission('ASSIGNMENT_CHECKLIST_PROOF_DELETE') ? <Delete /> : undefined}
                            icon={<Download />}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
      {id && workflowTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 1, mt: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800}>Technician Work Logs</Typography>
              <Chip size="small" label={`${completedWorkLogCount}/${workLogRows.length}`} color={canCompleteWorkLogs ? 'success' : 'warning'} />
              <Chip size="small" label={`${workLogProgress}% completed`} color={workLogProgress === 100 && workLogRows.length ? 'success' : 'warning'} variant="outlined" />
            </Stack>
            {!isView && editingWorkLogId && <Button variant="outlined" size="small" onClick={resetWorkLogForm}>New Log</Button>}
          </Stack>
          <LinearProgress variant="determinate" value={workLogProgress} sx={{ mb: 2 }} />
          {!isView && hasPermission(editingWorkLogId ? 'ASSIGNMENT_WORK_LOG_UPDATE' : 'ASSIGNMENT_WORK_LOG_CREATE') && (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <CommonDropdown required label="Technician" value={workLogForm.technicianEmployeeId} onChange={updateWorkLogForm('technicianEmployeeId')} options={workLogTechnicianOptions} />
              </Grid>
              <Grid item xs={12} md={2}><CommonDateTimePicker required label="Start Time" value={workLogForm.startTime} onChange={updateWorkLogForm('startTime')} /></Grid>
              <Grid item xs={12} md={2}><CommonDateTimePicker label="End Time" value={workLogForm.endTime} onChange={updateWorkLogForm('endTime')} /></Grid>
              <Grid item xs={12} md={2}>
                <CommonDropdown label="Status" value={workLogForm.completionStatus} onChange={updateWorkLogForm('completionStatus')} options={workLogStatusDropdownOptions} />
              </Grid>
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
                    <Typography variant="caption" color="text.secondary">
                      {row.startTime ? new Date(row.startTime).toLocaleString() : ''}{row.endTime ? ` - ${new Date(row.endTime).toLocaleString()}` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={1.5}><Chip size="small" label={(row.completionStatus || '').replaceAll('_', ' ')} color={row.completionStatus === 'COMPLETED' ? 'success' : row.completionStatus === 'FOLLOW_UP_REQUIRED' ? 'warning' : 'default'} /></Grid>
                  <Grid item xs={12} md={2}><Typography variant="body2">{row.issueFound || '-'}</Typography></Grid>
                  <Grid item xs={12} md={2}><Typography variant="body2">{row.actionTaken || '-'}</Typography></Grid>
                  <Grid item xs={12} md={2}><Typography variant="body2" color="text.secondary">{row.workNotes || '-'}</Typography></Grid>
                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap" useFlexGap>
                      {!isView && hasPermission('ASSIGNMENT_WORK_LOG_UPDATE') && (
                        <Tooltip title="Edit"><IconButton color="primary" onClick={() => handleEditWorkLog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                      )}
                      {!isView && hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_UPLOAD') && (
                        <Tooltip title="Upload attachment">
                          <IconButton component="label">
                            <UploadFile fontSize="small" />
                            <input type="file" hidden onChange={(event) => handleUploadWorkLogAttachment(row, event.target.files?.[0])} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!isView && hasPermission('ASSIGNMENT_WORK_LOG_DELETE') && (
                        <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDeleteWorkLog(row)}><Delete fontSize="small" /></IconButton></Tooltip>
                      )}
                    </Stack>
                  </Grid>
                  {(row.attachments || []).length > 0 && (
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(row.attachments || []).map((attachment) => (
                          <Chip
                            key={attachment.id}
                            size="small"
                            label={attachment.originalFileName}
                            onClick={() => handleDownloadWorkLogAttachment(row, attachment)}
                            onDelete={!isView && hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE') ? () => handleDeleteWorkLogAttachment(row, attachment) : undefined}
                            deleteIcon={!isView && hasPermission('ASSIGNMENT_WORK_LOG_ATTACHMENT_DELETE') ? <Delete /> : undefined}
                            icon={<Download />}
                          />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
      {id && workflowTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 1, mt: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Spare Part Requests</Typography>
          {!isView && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}>
                <CommonDropdown label="Spare Part" value={spareForm.stockId} onChange={updateSpareField('stockId')} options={sparePartOptions} />
              </Grid>
              <Grid item xs={12} md={2}><CommonInput type="number" label="Quantity" value={spareForm.quantityUsed} onChange={updateSpareField('quantityUsed')} /></Grid>
              <Grid item xs={12} md={3}><CommonInput label="Remarks" value={spareForm.remarks} onChange={updateSpareField('remarks')} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={handleAddSpare}>Request Spare</Button></Grid>
            </Grid>
          )}
          <Box sx={{ height: 320 }}>
            <DataGrid rows={spareRows} columns={spareColumns} disableRowSelectionOnClick pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
          </Box>
        </Paper>
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

export default MaintenanceAssignmentFormPage;
