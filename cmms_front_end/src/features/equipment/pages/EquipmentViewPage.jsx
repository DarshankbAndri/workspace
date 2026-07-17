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
  createEquipmentSpareBom,
  deleteEquipmentDocument,
  deleteEquipmentSpareBom,
  downloadEquipmentDocument,
  getEquipmentById,
  getEquipmentActiveAmc,
  getEquipmentDocuments,
  getEquipmentHealth,
  getEquipmentSpareBom,
  getEquipmentSummary,
  updateEquipmentSpareBom,
  uploadEquipmentDocument,
} from '../services/equipmentService';
import { getSparePartsBySite } from '../../spareParts/services/sparePartService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFileUpload from '../../../shared/components/common/CommonFileUpload';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';

const initialSpareBomForm = {
  stockId: '',
  recommendedQty: '',
  criticality: 'MEDIUM',
  replacementFrequency: '',
  status: 'ACTIVE',
  remarks: '',
};

const initialDocumentForm = {
  documentType: 'MANUAL',
  expiryDate: '',
  remarks: '',
};

const criticalityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

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
  const [health, setHealth] = React.useState(null);
  const [activeAmc, setActiveAmc] = React.useState(null);
  const [spareBomRows, setSpareBomRows] = React.useState([]);
  const [siteSpares, setSiteSpares] = React.useState([]);
  const [spareBomForm, setSpareBomForm] = React.useState(initialSpareBomForm);
  const [editingBomId, setEditingBomId] = React.useState(null);
  const [documents, setDocuments] = React.useState([]);
  const [documentForm, setDocumentForm] = React.useState(initialDocumentForm);
  const [documentFile, setDocumentFile] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [loading, setLoading] = React.useState(true);
  const [spareBomLoading, setSpareBomLoading] = React.useState(false);
  const [spareBomSaving, setSpareBomSaving] = React.useState(false);
  const [documentsLoading, setDocumentsLoading] = React.useState(false);
  const [documentUploading, setDocumentUploading] = React.useState(false);
  const [deleteBomRow, setDeleteBomRow] = React.useState(null);
  const [deleteDocumentRow, setDeleteDocumentRow] = React.useState(null);
  const [error, setError] = React.useState('');
  const [spareBomError, setSpareBomError] = React.useState('');
  const [documentError, setDocumentError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getEquipmentById(id), getEquipmentSummary(id), getEquipmentHealth(id)])
      .then(([equipmentData, summaryData, healthData]) => {
        setEquipment(equipmentData);
        setSummary(summaryData);
        setHealth(healthData);
      })
      .catch(() => setError('Unable to load equipment dashboard.'))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    if (!hasPermission(PERMISSIONS.VENDOR_AMC_VIEW)) return;
    getEquipmentActiveAmc(id)
      .then((data) => setActiveAmc(data || null))
      .catch(() => setActiveAmc(null));
  }, [hasPermission, id]);

  const canEdit = hasPermission(PERMISSIONS.EQUIPMENT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.EQUIPMENT_DELETE);

  const loadSpareBom = React.useCallback(() => {
    setSpareBomLoading(true);
    setSpareBomError('');
    getEquipmentSpareBom(id)
      .then((data) => setSpareBomRows(data || []))
      .catch((err) => setSpareBomError(formatApiError(err, 'Unable to load equipment spare BOM.')))
      .finally(() => setSpareBomLoading(false));
  }, [id]);

  const loadSiteSpares = React.useCallback((siteId) => {
    if (!siteId) {
      setSiteSpares([]);
      return Promise.resolve();
    }
    return getSparePartsBySite(siteId)
      .then((data) => setSiteSpares(data || []))
      .catch((err) => setSpareBomError(formatApiError(err, 'Unable to load site spare parts.')));
  }, []);

  const loadDocuments = React.useCallback(() => {
    setDocumentsLoading(true);
    setDocumentError('');
    getEquipmentDocuments(id)
      .then(setDocuments)
      .catch((err) => setDocumentError(formatApiError(err, 'Unable to load equipment documents.')))
      .finally(() => setDocumentsLoading(false));
  }, [id]);

  React.useEffect(() => {
    if (activeTab === 'spares') {
      loadSpareBom();
      loadSiteSpares(equipment?.siteId);
    }
  }, [activeTab, equipment?.siteId, loadSiteSpares, loadSpareBom]);

  React.useEffect(() => {
    if (activeTab === 'documents') {
      loadDocuments();
    }
  }, [activeTab, loadDocuments]);

  const updateSpareBomField = (field) => (event) => {
    setSpareBomForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetSpareBomForm = () => {
    setSpareBomForm(initialSpareBomForm);
    setEditingBomId(null);
  };

  const handleSaveSpareBom = async () => {
    setSpareBomError('');
    if (!spareBomForm.stockId || !spareBomForm.recommendedQty) {
      setSpareBomError('Spare part and recommended quantity are required.');
      return;
    }
    setSpareBomSaving(true);
    try {
      const payload = {
        ...spareBomForm,
        stockId: Number(spareBomForm.stockId),
        recommendedQty: Number(spareBomForm.recommendedQty),
      };
      if (editingBomId) {
        await updateEquipmentSpareBom(id, editingBomId, payload);
      } else {
        await createEquipmentSpareBom(id, payload);
      }
      resetSpareBomForm();
      await loadSpareBom();
    } catch (err) {
      setSpareBomError(formatApiError(err, 'Unable to save equipment spare BOM.'));
    } finally {
      setSpareBomSaving(false);
    }
  };

  const handleEditSpareBom = (row) => {
    setEditingBomId(row.bomId);
    setSpareBomForm({
      stockId: row.stockId || '',
      recommendedQty: row.recommendedQty ?? '',
      criticality: row.criticality || 'MEDIUM',
      replacementFrequency: row.replacementFrequency || '',
      status: row.status || 'ACTIVE',
      remarks: row.remarks || '',
    });
  };

  const confirmDeleteSpareBom = async () => {
    if (!deleteBomRow) return;
    setSpareBomError('');
    try {
      await deleteEquipmentSpareBom(id, deleteBomRow.bomId);
      setDeleteBomRow(null);
      if (editingBomId === deleteBomRow.bomId) {
        resetSpareBomForm();
      }
      await loadSpareBom();
    } catch (err) {
      setSpareBomError(formatApiError(err, 'Unable to delete equipment spare BOM.'));
    }
  };

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
    { label: 'Asset Number', value: equipment?.assetNumber },
    { label: 'Purchase Date', value: formatDate(equipment?.purchaseDate) },
    { label: 'Purchase Cost', value: formatMoney(equipment?.purchaseCost) },
    { label: 'Capitalization Date', value: formatDate(equipment?.capitalizationDate) },
    { label: 'Depreciation Method', value: formatLabel(equipment?.depreciationMethod) },
    { label: 'Cost Center', value: equipment?.costCenter },
    { label: 'Department', value: equipment?.department },
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
              {hasPermission(PERMISSIONS.VENDOR_AMC_VIEW) && <Tab value="amc" label="AMC Details" />}
              <Tab value="downtime" label="Downtime History" />
              <Tab value="spares" label="Spare BOM" />
              <Tab value="documents" label="Documents" />
              <Tab value="meters" label="Meter Readings" />
              <Tab value="cost" label="Cost Summary" />
            </Tabs>

            {activeTab === 'overview' && (
              <Stack spacing={3}>
                <SummaryGrid summary={summary} health={health} />
                <HealthGrid health={health} />
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

            {activeTab === 'amc' && hasPermission(PERMISSIONS.VENDOR_AMC_VIEW) && (
              activeAmc ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}><Metric label="AMC Status" value={activeAmc.status} variant={activeAmc.status === 'ACTIVE' ? 'success-chip' : 'warning-chip'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Vendor" value={activeAmc.vendorName} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Contract Number" value={activeAmc.contractNumber} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Contract Name" value={activeAmc.contractName} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Coverage Period" value={`${activeAmc.startDate || '-'} to ${activeAmc.endDate || '-'}`} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Coverage Type" value={activeAmc.equipmentMappings?.[0]?.coverageType || 'FULL'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Labor Included" value={activeAmc.includesLabor ? 'Yes' : 'No'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Spares Included" value={activeAmc.includesSpares ? 'Yes' : 'No'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Response SLA" value={activeAmc.responseTimeHours ? `${activeAmc.responseTimeHours} hr` : '-'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Resolution SLA" value={activeAmc.resolutionTimeHours ? `${activeAmc.resolutionTimeHours} hr` : '-'} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Contact Person" value={activeAmc.contactPerson} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Contact Phone" value={activeAmc.contactPhone} /></Grid>
                  <Grid item xs={12} sm={6} md={3}><Metric label="Days Remaining" value={activeAmc.daysRemaining} /></Grid>
                </Grid>
              ) : (
                <EmptyPanel title="AMC Details" value="No active AMC is available for this equipment." />
              )
            )}

            {activeTab === 'downtime' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Duration" value={formatMinutes(summary?.lastDowntimeMinutes)} /></Grid>
                <Grid item xs={12} md={3}><Metric label="Last Reason" value={summary?.lastDowntimeReason} /></Grid>
              </Grid>
            )}

            {activeTab === 'spares' && (
              <EquipmentSpareBomTab
                rows={spareBomRows}
                siteSpares={siteSpares}
                form={spareBomForm}
                loading={spareBomLoading}
                saving={spareBomSaving}
                error={spareBomError}
                editingBomId={editingBomId}
                canEdit={canEdit}
                canDelete={canDelete}
                onFieldChange={updateSpareBomField}
                onSave={handleSaveSpareBom}
                onCancel={resetSpareBomForm}
                onEdit={handleEditSpareBom}
                onDelete={setDeleteBomRow}
              />
            )}
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
                <Grid item xs={12} sm={6} md={3}><Metric label="Purchase Cost" value={formatMoney(summary?.purchaseCost)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Maintenance Cost" value={formatMoney(summary?.maintenanceCost)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Spare/Material Cost" value={formatMoney(summary?.spareMaterialCost)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Downtime Cost" value={formatMoney(summary?.downtimeCost)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Total Cost of Ownership" value={formatMoney(summary?.totalCostOfOwnership)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Asset Number" value={equipment?.assetNumber} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Cost Center" value={equipment?.costCenter} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Department" value={equipment?.department} /></Grid>
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
        open={Boolean(deleteBomRow)}
        handleClose={() => setDeleteBomRow(null)}
        title="Delete spare BOM line?"
        message={deleteBomRow ? `${deleteBomRow.partCode} - ${deleteBomRow.partName} will be removed from this equipment BOM.` : ''}
        handleAgree={confirmDeleteSpareBom}
        closebtn="Cancel"
        agreebtn="Delete"
      />

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

function EquipmentSpareBomTab({
  rows,
  siteSpares,
  form,
  loading,
  saving,
  error,
  editingBomId,
  canEdit,
  canDelete,
  onFieldChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}) {
  const spareOptions = React.useMemo(() => siteSpares.map((item) => ({
    value: item.id,
    label: `${item.partCode} - ${item.partName} | Available: ${formatNumber(item.availableStock ?? item.currentStock)} ${item.unit || ''}`,
  })), [siteSpares]);

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      {canEdit && (
        <Box>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={4}>
              <CommonDropdown
                label="Spare Part"
                name="stockId"
                value={form.stockId}
                options={spareOptions}
                onChange={onFieldChange('stockId')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <CommonInput
                label="Recommended Qty"
                name="recommendedQty"
                type="number"
                value={form.recommendedQty}
                onChange={onFieldChange('recommendedQty')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <CommonDropdown
                label="Criticality"
                name="criticality"
                value={form.criticality}
                options={criticalityOptions}
                onChange={onFieldChange('criticality')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <CommonInput
                label="Replacement Frequency"
                name="replacementFrequency"
                value={form.replacementFrequency}
                onChange={onFieldChange('replacementFrequency')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <CommonDropdown
                label="Status"
                name="status"
                value={form.status}
                options={statusOptions}
                onChange={onFieldChange('status')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <CommonTextArea
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={onFieldChange('remarks')}
                minRows={1}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                {editingBomId && <Button variant="outlined" onClick={onCancel}>Cancel</Button>}
                <Button
                  variant="contained"
                  onClick={onSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress color="inherit" size={16} /> : null}
                >
                  {editingBomId ? 'Update BOM' : 'Add BOM'}
                </Button>
              </Stack>
            </Grid>
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
                <TableCell>Part</TableCell>
                <TableCell>Recommended</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Criticality</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">No spare BOM records available.</Typography>
                  </TableCell>
                </TableRow>
              ) : rows.map((row) => (
                <TableRow key={row.bomId} hover selected={editingBomId === row.bomId}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{row.partCode} - {row.partName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.category || '-'} | {row.unit || '-'}</Typography>
                  </TableCell>
                  <TableCell>{formatNumber(row.recommendedQty)} {row.unit || ''}</TableCell>
                  <TableCell>{formatNumber(row.availableStock)} {row.unit || ''}</TableCell>
                  <TableCell>
                    <Chip size="small" label={formatLabel(row.criticality)} color={criticalityColor(row.criticality)} />
                  </TableCell>
                  <TableCell>{row.replacementFrequency || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={formatLabel(row.status)} color={row.status === 'ACTIVE' ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{row.remarks || '-'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {canEdit && (
                      <Tooltip title="Edit">
                        <IconButton aria-label="Edit spare BOM" onClick={() => onEdit(row)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete">
                        <IconButton aria-label="Delete spare BOM" color="error" onClick={() => onDelete(row)}>
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

function SummaryGrid({ summary, health }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Score" value={health?.healthScore == null ? '' : `${health.healthScore}%`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Status" value={health?.healthStatus} variant={healthVariant(health?.healthStatus)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Active PM" value={summary?.activePmCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Downtime This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Maintenance" value={formatDate(summary?.lastMaintenanceDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Next PM Date" value={formatDate(summary?.nextPmDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
    </Grid>
  );
}

function HealthGrid({ health }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}><Metric label="MTBF" value={formatHours(health?.mtbfHours)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="MTTR" value={formatHours(health?.mttrHours)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Failure" value={formatDateTime(health?.lastFailureDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Repeated Failure Count" value={health?.repeatedFailureCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="90 Day Failures" value={health?.downtimeFrequency90Days} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="90 Day Downtime" value={formatMinutes(health?.downtimeMinutes90Days)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Critical Open Requests" value={health?.criticalOpenRequestCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Asset Age" value={health?.assetAgeYears == null ? '' : `${health.assetAgeYears} yr`} /></Grid>
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

function criticalityColor(criticality) {
  if (criticality === 'CRITICAL') return 'error';
  if (criticality === 'HIGH') return 'warning';
  if (criticality === 'MEDIUM') return 'info';
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

function formatHours(value) {
  if (value === null || value === undefined || value === '') return '';
  const hours = Number(value);
  if (!Number.isFinite(hours)) return '';
  return `${hours.toFixed(2)} hr`;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return Number.isInteger(number) ? String(number) : number.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
