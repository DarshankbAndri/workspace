import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, Download, Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  deleteEquipmentDocument,
  downloadEquipmentDocument,
  getEquipmentById,
  getEquipmentDocuments,
  getEquipmentSummary,
  uploadEquipmentDocument,
} from '../services/equipmentService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFileUpload from '../../../shared/components/common/CommonFileUpload';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';

const initialDocumentForm = {
  documentType: 'MANUAL',
  expiryDate: '',
  remarks: '',
};

const documentTypeOptions = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'DRAWING', label: 'Drawing' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'INSPECTION_REPORT', label: 'Inspection Report' },
  { value: 'SOP', label: 'SOP' },
  { value: 'WARRANTY', label: 'Warranty' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'OTHER', label: 'Other' },
];

function EquipmentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [equipment, setEquipment] = React.useState(null);
  const [summary, setSummary] = React.useState(null);
  const [documents, setDocuments] = React.useState([]);
  const [documentForm, setDocumentForm] = React.useState(initialDocumentForm);
  const [documentFile, setDocumentFile] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [loading, setLoading] = React.useState(true);
  const [documentsLoading, setDocumentsLoading] = React.useState(false);
  const [documentUploading, setDocumentUploading] = React.useState(false);
  const [deleteDocumentRow, setDeleteDocumentRow] = React.useState(null);
  const [error, setError] = React.useState('');
  const [documentError, setDocumentError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getEquipmentById(id), getEquipmentSummary(id)])
      .then(([equipmentData, summaryData]) => {
        setEquipment(equipmentData);
        setSummary(summaryData);
      })
      .catch(() => setError('Unable to load equipment dashboard.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission(PERMISSIONS.EQUIPMENT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.EQUIPMENT_DELETE);

  const loadDocuments = React.useCallback(() => {
    setDocumentsLoading(true);
    setDocumentError('');
    getEquipmentDocuments(id)
      .then(setDocuments)
      .catch((err) => setDocumentError(formatApiError(err, 'Unable to load equipment documents.')))
      .finally(() => setDocumentsLoading(false));
  }, [id]);

  React.useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab, loadDocuments]);

  const updateDocumentField = (field) => (event) => {
    setDocumentForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleDocumentFileChange = (event) => {
    setDocumentFile(event.target.files?.[0] || null);
    event.target.value = '';
  };

  const handleUploadDocument = async () => {
    if (!documentFile) {
      setDocumentError('Select a document file before uploading.');
      return;
    }
    setDocumentUploading(true);
    setDocumentError('');
    try {
      await uploadEquipmentDocument(id, { ...documentForm, file: documentFile });
      setDocumentForm(initialDocumentForm);
      setDocumentFile(null);
      await loadDocuments();
    } catch (err) {
      setDocumentError(formatApiError(err, 'Unable to upload equipment document.'));
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    setDocumentError('');
    try {
      const response = await downloadEquipmentDocument(id, document.documentId);
      downloadBlob(response, document.fileName || 'equipment-document');
    } catch (err) {
      setDocumentError(formatApiError(err, 'Unable to download equipment document.'));
    }
  };

  const confirmDeleteDocument = async () => {
    if (!deleteDocumentRow) return;
    setDocumentError('');
    try {
      await deleteEquipmentDocument(id, deleteDocumentRow.documentId);
      setDeleteDocumentRow(null);
      await loadDocuments();
    } catch (err) {
      setDocumentError(formatApiError(err, 'Unable to delete equipment document.'));
    }
  };

  const fields = [
    { label: 'Equipment Code', value: equipment?.equipmentCode },
    { label: 'Equipment Name', value: equipment?.equipmentName },
    { label: 'Site', value: formatSite(equipment) },
    { label: 'Category', value: equipment?.category },
    { label: 'Location', value: equipment?.location },
    { label: 'Manufacturer', value: equipment?.manufacturer },
    { label: 'Model Number', value: equipment?.modelNumber },
    { label: 'Serial Number', value: equipment?.serialNumber },
    { label: 'Status', value: equipment?.status, variant: 'chip' },
    { label: 'Lifecycle Status', value: equipment?.lifecycleStatus, variant: 'chip' },
    { label: 'Operating Status', value: equipment?.operatingStatus, variant: 'chip' },
    { label: 'Asset Condition', value: equipment?.assetCondition, variant: 'chip' },
    { label: 'Ownership Type', value: equipment?.ownershipType },
    { label: 'Installation Date', value: formatDate(equipment?.installationDate) },
    { label: 'Commissioning Date', value: formatDate(equipment?.commissioningDate) },
    { label: 'Warranty Expiry', value: formatDate(equipment?.warrantyExpiryDate) },
    { label: 'Decommission Date', value: formatDate(equipment?.decommissionDate) },
    { label: 'Criticality', value: equipment?.criticality, variant: 'chip' },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Equipment</Typography>
          <Typography variant="body2" color="text.secondary">{equipment?.equipmentName || 'Equipment details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/equipment/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CommonFormCard>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 18 }).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onChange={(event, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="overview" label="Overview" />
              <Tab value="requests" label="Open Requests" />
              <Tab value="pm" label="PM Schedule" />
              <Tab value="downtime" label="Downtime History" />
              <Tab value="spares" label="Spare BOM" />
              <Tab value="documents" label="Documents" />
              <Tab value="meters" label="Meter Readings" />
              <Tab value="cost" label="Cost Summary" />
            </Tabs>

            {activeTab === 'overview' && (
              <Stack spacing={3}>
                <SummaryGrid summary={summary} />
                <Grid container spacing={2.5}>
                  {fields.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.label}>
                      <DetailItem label={field.label} value={field.value} variant={field.variant} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {activeTab === 'requests' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Impact" value={summary?.openRequestCount > 0 ? 'Attention' : 'Clear'} variant={summary?.openRequestCount > 0 ? 'warning-chip' : 'success-chip'} /></Grid>
              </Grid>
            )}

            {activeTab === 'pm' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Active PM" value={summary?.activePmCount} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Next PM Date" value={formatDate(summary?.nextPmDate)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Maintenance" value={formatDate(summary?.lastMaintenanceDate)} /></Grid>
              </Grid>
            )}

            {activeTab === 'downtime' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Duration" value={formatMinutes(summary?.lastDowntimeMinutes)} /></Grid>
                <Grid item xs={12} md={3}><Metric label="Last Reason" value={summary?.lastDowntimeReason} /></Grid>
              </Grid>
            )}

            {activeTab === 'spares' && <EmptyPanel title="Spare BOM" value="No spare BOM records available." />}
            {activeTab === 'documents' && (
              <EquipmentDocumentsTab
                documents={documents}
                form={documentForm}
                file={documentFile}
                loading={documentsLoading}
                uploading={documentUploading}
                error={documentError}
                canUpload={canEdit}
                canDelete={canDelete}
                onFieldChange={updateDocumentField}
                onFileChange={handleDocumentFileChange}
                onUpload={handleUploadDocument}
                onDownload={handleDownloadDocument}
                onDelete={setDeleteDocumentRow}
              />
            )}
            {activeTab === 'meters' && <EmptyPanel title="Meter Readings" value="No meter readings recorded." />}

            {activeTab === 'cost' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Score" value={summary?.healthScore == null ? '' : `${summary.healthScore}%`} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Status" value={summary?.healthStatus} variant={healthVariant(summary?.healthStatus)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Downtime This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
              </Grid>
            )}
          </>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/equipment')}
          cancelLabel="Back"
        />
      </CommonFormCard>

      <ConfirmDialog
        open={Boolean(deleteDocumentRow)}
        handleClose={() => setDeleteDocumentRow(null)}
        title="Delete equipment document?"
        message={deleteDocumentRow ? `${deleteDocumentRow.fileName} will be removed from this equipment.` : ''}
        handleAgree={confirmDeleteDocument}
        closebtn="Cancel"
        agreebtn="Delete"
      />
    </Box>
  );
}

function EquipmentDocumentsTab({
  documents,
  form,
  file,
  loading,
  uploading,
  error,
  canUpload,
  canDelete,
  onFieldChange,
  onFileChange,
  onUpload,
  onDownload,
  onDelete,
}) {
  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      {canUpload && (
        <Box>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
              <CommonDropdown
                label="Document Type"
                name="documentType"
                value={form.documentType}
                options={documentTypeOptions}
                onChange={onFieldChange('documentType')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CommonDatePicker
                label="Expiry Date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={onFieldChange('expiryDate')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonTextArea
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={onFieldChange('remarks')}
                minRows={1}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack spacing={1} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                <CommonFileUpload
                  label="Choose File"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx,.xls,.xlsx"
                  onChange={onFileChange}
                  disabled={uploading}
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={onUpload}
                  disabled={uploading || !file}
                  startIcon={uploading ? <CircularProgress color="inherit" size={16} /> : null}
                >
                  Upload
                </Button>
              </Stack>
            </Grid>
            {file && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">{file.name}</Typography>
              </Grid>
            )}
          </Grid>
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Skeleton variant="rounded" height={54} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Box}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography variant="body2" color="text.secondary">No equipment documents uploaded.</Typography>
                  </TableCell>
                </TableRow>
              ) : documents.map((document) => (
                <TableRow key={document.documentId} hover>
                  <TableCell>{formatLabel(document.documentType)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                      {document.fileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{document.contentType}</Typography>
                  </TableCell>
                  <TableCell>{renderExpiry(document.expiryDate)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDateTime(document.uploadedAt) || '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{document.uploadedByName || '-'}</Typography>
                  </TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{document.remarks || '-'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton aria-label="Download equipment document" onClick={() => onDownload(document)}>
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canDelete && (
                      <Tooltip title="Delete">
                        <IconButton aria-label="Delete equipment document" color="error" onClick={() => onDelete(document)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}

function SummaryGrid({ summary }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Score" value={summary?.healthScore == null ? '' : `${summary.healthScore}%`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Status" value={summary?.healthStatus} variant={healthVariant(summary?.healthStatus)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Active PM" value={summary?.activePmCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Downtime This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Maintenance" value={formatDate(summary?.lastMaintenanceDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Next PM Date" value={formatDate(summary?.nextPmDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
    </Grid>
  );
}

function Metric({ label, value, variant }) {
  const display = displayValue(value);
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, minHeight: 82 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
        {label}
      </Typography>
      {variant && display !== '-' ? (
        <Chip size="small" label={display} color={chipColor(variant)} variant={variant === 'chip' ? 'outlined' : 'filled'} />
      ) : (
        <Typography variant="h6" fontWeight={800} sx={{ wordBreak: 'break-word' }}>
          {display}
        </Typography>
      )}
    </Box>
  );
}

function EmptyPanel({ title, value }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{value}</Typography>
    </Box>
  );
}

function DetailItem({ label, value, variant }) {
  const display = displayValue(value);
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      {variant === 'chip' && display !== '-' ? (
        <Chip size="small" label={display} variant="outlined" />
      ) : (
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {display}
        </Typography>
      )}
    </Box>
  );
}

function chipColor(variant) {
  if (variant === 'success-chip') return 'success';
  if (variant === 'warning-chip') return 'warning';
  if (variant === 'error-chip') return 'error';
  return 'default';
}

function healthVariant(status) {
  if (status === 'GOOD') return 'success-chip';
  if (status === 'WARNING') return 'warning-chip';
  if (status === 'CRITICAL') return 'error-chip';
  return 'chip';
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatSite(equipment) {
  if (!equipment?.siteName && !equipment?.siteCode) return '';
  if (!equipment.siteCode) return equipment.siteName;
  if (!equipment.siteName) return equipment.siteCode;
  return `${equipment.siteName} (${equipment.siteCode})`;
}

function formatDate(value) {
  return value || '';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '';
}

function formatLabel(value) {
  return value ? String(value).replaceAll('_', ' ') : '-';
}

function formatMinutes(value) {
  if (value === null || value === undefined || value === '') return '';
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 60) return `${minutes} min`;
  return `${(minutes / 60).toFixed(1)} hr`;
}

function formatFileSize(value) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderExpiry(value) {
  if (!value) return '-';
  const expired = new Date(value) < new Date(new Date().toISOString().slice(0, 10));
  return expired ? <Chip size="small" label={value} color="warning" /> : value;
}

function formatApiError(err, fallback) {
  const apiError = err.response?.data || err.apiError;
  if (!apiError) return fallback;
  const details = Array.isArray(apiError.details) && apiError.details.length
    ? ` ${apiError.details.map((detail) => detail.field ? `${detail.field}: ${detail.message}` : detail.message).join(' ')}`
    : '';
  const code = apiError.code ? ` (${apiError.code})` : '';
  const correlation = apiError.correlationId ? ` Correlation: ${apiError.correlationId}` : '';
  return `${apiError.message || fallback}${code}.${details}${correlation}`.trim();
}

function downloadBlob(response, fallbackName) {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default EquipmentViewPage;
