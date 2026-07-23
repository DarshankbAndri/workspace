import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  createSparePart,
  createSparePartEquipmentBom,
  deleteSparePartEquipmentBom,
  getSparePartById,
  getSparePartEquipmentBom,
  updateSparePart,
  updateSparePartEquipmentBom,
} from '../services/sparePartService';
import { getSites } from '../../site/services/siteService';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import { getEquipments } from '../../equipment/services/equipmentService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const initialForm = {
  partCode: '',
  partName: '',
  description: '',
  category: '',
  unit: 'PCS',
  preferredVendorId: '',
  siteId: '',
  currentStock: 0,
  minimumStock: 0,
  unitCost: 0,
  storageLocation: '',
  status: 'ACTIVE',
};

const SPARE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];
const BOM_CRITICALITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => ({ value, label: value }));
const BOM_STATUS_OPTIONS = SPARE_STATUS_OPTIONS;
const initialBomForm = {
  equipmentId: '',
  recommendedQty: 1,
  criticality: 'MEDIUM',
  replacementFrequency: '',
  status: 'ACTIVE',
  remarks: '',
};

function SparePartFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [bomRows, setBomRows] = React.useState([]);
  const [deletedBomIds, setDeletedBomIds] = React.useState([]);
  const [bomForm, setBomForm] = React.useState(initialBomForm);
  const [editingBomId, setEditingBomId] = React.useState(null);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites()
      .then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getSparePartById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          preferredVendorId: data.preferredVendorId || '',
          siteId: data.siteId || '',
          currentStock: data.currentStock ?? 0,
          minimumStock: data.minimumStock ?? 0,
          unitCost: data.unitCost ?? 0,
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load spare part.'));
      getSparePartEquipmentBom(id)
        .then((data) => {
          setBomRows(data || []);
          setDeletedBomIds([]);
        })
        .catch((err) => setError(err.response?.data?.message || 'Unable to load linked equipment BOM.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (!form.siteId) {
      setVendors([]);
      setEquipments([]);
      return;
    }
    getVendorsBySite(form.siteId)
      .then((data) => setVendors(data || []))
      .catch(() => setError('Unable to load vendors for selected site.'));
    getEquipments(form.siteId)
      .then((data) => setEquipments((data || []).filter((equipment) => equipment.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load equipment for selected site.'));
  }, [form.siteId]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => {
    setForm((current) => ({ ...current, siteId: event.target.value, preferredVendorId: '' }));
    if (!isEdit) {
      setBomRows([]);
      setDeletedBomIds([]);
      setBomForm(initialBomForm);
      setEditingBomId(null);
    }
  };
  const updateBomField = (field) => (event) => setBomForm((current) => ({ ...current, [field]: event.target.value }));
  const resetBomForm = () => {
    setBomForm(initialBomForm);
    setEditingBomId(null);
  };

  const handleSaveBomRow = async () => {
    setError('');
    if (!bomForm.equipmentId || !bomForm.recommendedQty) {
      setError('Equipment and recommended quantity are required for linked equipment BOM.');
      return false;
    }
    const duplicate = bomRows.some((row) => (
      String(row.equipmentId) === String(bomForm.equipmentId)
      && String(row.bomId || row.localId) !== String(editingBomId || '')
    ));
    if (duplicate) {
      setError('This equipment is already linked to this spare part BOM.');
      return false;
    }
    const selectedEquipment = equipments.find((equipment) => String(equipment.id) === String(bomForm.equipmentId));
    const payload = {
      ...bomForm,
      equipmentId: Number(bomForm.equipmentId),
      recommendedQty: Number(bomForm.recommendedQty || 0),
    };
    if (editingBomId) {
      setBomRows((current) => current.map((row) => (
        String(row.bomId || row.localId) === String(editingBomId)
          ? { ...row, ...payload, ...equipmentSummary(selectedEquipment) }
          : row
      )));
    } else {
      setBomRows((current) => [
        ...current,
        { ...payload, ...equipmentSummary(selectedEquipment), localId: `new-${Date.now()}-${Math.random()}` },
      ]);
    }
    resetBomForm();
    return true;
  };

  const handleEditBomRow = (row) => {
    setEditingBomId(row.bomId || row.localId);
    setBomForm({
      equipmentId: row.equipmentId || '',
      recommendedQty: row.recommendedQty ?? 1,
      criticality: row.criticality || 'MEDIUM',
      replacementFrequency: row.replacementFrequency || '',
      status: row.status || 'ACTIVE',
      remarks: row.remarks || '',
    });
  };

  const handleDeleteBomRow = (row) => {
    setError('');
    if (row.bomId) {
      setDeletedBomIds((current) => Array.from(new Set([...current, row.bomId])));
    }
    setBomRows((current) => current.filter((item) => (item.bomId || item.localId) !== (row.bomId || row.localId)));
    if (editingBomId === (row.bomId || row.localId)) resetBomForm();
  };

  const saveBomRows = async (stockId) => {
    for (const bomId of deletedBomIds) {
      await deleteSparePartEquipmentBom(stockId, bomId);
    }
    for (const row of bomRows) {
      const payload = {
        equipmentId: Number(row.equipmentId),
        recommendedQty: Number(row.recommendedQty || 0),
        criticality: row.criticality || 'MEDIUM',
        replacementFrequency: row.replacementFrequency || '',
        status: row.status || 'ACTIVE',
        remarks: row.remarks || '',
      };
      if (row.bomId) {
        await updateSparePartEquipmentBom(stockId, row.bomId, payload);
      } else {
        await createSparePartEquipmentBom(stockId, payload);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        preferredVendorId: form.preferredVendorId ? Number(form.preferredVendorId) : null,
        currentStock: Number(form.currentStock || 0),
        minimumStock: Number(form.minimumStock || 0),
        unitCost: Number(form.unitCost || 0),
      };
      if (isEdit) {
        await updateSparePart(id, payload);
        await saveBomRows(id);
      } else {
        const saved = await createSparePart(payload);
        const stockId = saved?.id || saved?.stockId;
        await saveBomRows(stockId);
      }
      navigate('/inventory/spare-parts');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save spare part.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const vendorOptions = React.useMemo(() => [
    { value: '', label: 'No preferred vendor' },
    ...vendors.map((v) => ({ value: v.id, label: v.vendorName })),
  ], [vendors]);
  const equipmentOptions = React.useMemo(() => equipments.map((equipment) => ({
    value: equipment.id,
    label: `${equipment.equipmentCode} - ${equipment.equipmentName}`,
  })), [equipments]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Spare Part' : isEdit ? 'Edit Spare Part' : 'Add Spare Part'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonFormCard component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView || isEdit} label="Part Code" value={form.partCode || ''} onChange={updateField('partCode')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Part Name" value={form.partName || ''} onChange={updateField('partName')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Unit" value={form.unit || ''} onChange={updateField('unit')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Category" value={form.category || ''} onChange={updateField('category')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown required disabled={isView || isEdit} label="Site" value={form.siteId || ''} onChange={updateSite} options={siteOptions} />
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown disabled={isView || !form.siteId} label="Preferred Vendor" value={form.preferredVendorId || ''} onChange={updateField('preferredVendorId')} options={vendorOptions} />
          </Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView || isEdit} label="Opening Stock" value={form.currentStock ?? 0} onChange={updateField('currentStock')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Minimum Stock" value={form.minimumStock ?? 0} onChange={updateField('minimumStock')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Unit Cost" value={form.unitCost ?? 0} onChange={updateField('unitCost')} /></Grid>
          <Grid item xs={12} md={3}>
            <CommonDropdown disabled={isView} label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={SPARE_STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={6}><CommonInput disabled={isView} label="Storage Location" value={form.storageLocation || ''} onChange={updateField('storageLocation')} /></Grid>
          <Grid item xs={12} md={6}><CommonTextArea disabled={isView} minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <LinkedEquipmentBomSection
              rows={bomRows}
              form={bomForm}
              equipmentOptions={equipmentOptions}
              disabled={isView || !form.siteId}
              editingBomId={editingBomId}
              equipmentDisabled={Boolean(isEdit && editingBomId)}
              onFieldChange={updateBomField}
              onSave={handleSaveBomRow}
              onEdit={handleEditBomRow}
              onDelete={handleDeleteBomRow}
              onCancel={resetBomForm}
            />
          </Grid>
        </Grid>
        <CommonFormActions
          saving={saving}
          showSave={!isView}
          onCancel={() => navigate('/inventory/spare-parts')}
          cancelLabel={isView ? 'Back' : 'Cancel'}
        />
      </CommonFormCard>
    </Box>
  );
}

export default SparePartFormPage;

function LinkedEquipmentBomSection({ rows, form, equipmentOptions, disabled, editingBomId, equipmentDisabled, onFieldChange, onSave, onEdit, onDelete, onCancel }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogError, setDialogError] = React.useState('');

  const openAddDialog = () => {
    onCancel();
    setDialogError('');
    setDialogOpen(true);
  };

  const openEditDialog = (row) => {
    onEdit(row);
    setDialogError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogError('');
    onCancel();
  };

  const submitDialog = async () => {
    setDialogError('');
    if (!form.equipmentId || !form.recommendedQty) {
      setDialogError('Equipment and recommended quantity are required.');
      return;
    }
    const duplicate = rows.some((row) => (
      String(row.equipmentId) === String(form.equipmentId)
      && String(row.bomId || row.localId) !== String(editingBomId || '')
    ));
    if (duplicate) {
      setDialogError('This equipment is already linked to this spare part BOM.');
      return;
    }
    const saved = await onSave();
    if (saved) {
      setDialogOpen(false);
    } else {
      setDialogError('Unable to save linked equipment BOM.');
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
        <Typography variant="h6" fontWeight={800}>Linked Equipment BOM</Typography>
        {!disabled && (
          <Button type="button" variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            Add Link
          </Button>
        )}
      </Stack>
      {!disabled && (
        <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingBomId ? 'Update Equipment Link' : 'Add Equipment Link'}</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <CommonDropdown required disabled={equipmentDisabled} label="Equipment" value={form.equipmentId} onChange={onFieldChange('equipmentId')} options={equipmentOptions} />
            <CommonInput required type="number" label="Recommended Qty" value={form.recommendedQty} onChange={onFieldChange('recommendedQty')} />
            <CommonDropdown label="Criticality" value={form.criticality} onChange={onFieldChange('criticality')} options={BOM_CRITICALITY_OPTIONS} />
            <CommonInput label="Replacement Frequency" value={form.replacementFrequency || ''} onChange={onFieldChange('replacementFrequency')} />
            <CommonDropdown label="Status" value={form.status} onChange={onFieldChange('status')} options={BOM_STATUS_OPTIONS} />
            <CommonTextArea minRows={2} label="Remarks" value={form.remarks || ''} onChange={onFieldChange('remarks')} />
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={closeDialog}>Cancel</Button>
            <Button type="button" variant="contained" startIcon={<Add />} onClick={submitDialog}>{editingBomId ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </Dialog>
      )}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell>Recommended</TableCell>
              <TableCell>Criticality</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              {!disabled && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={disabled ? 6 : 7}>No linked equipment BOM rows.</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.bomId || row.localId} hover selected={editingBomId === (row.bomId || row.localId)}>
                <TableCell>{formatEquipment(row)}</TableCell>
                <TableCell>{row.recommendedQty}</TableCell>
                <TableCell><Chip size="small" label={row.criticality || 'MEDIUM'} variant="outlined" /></TableCell>
                <TableCell>{row.replacementFrequency || '-'}</TableCell>
                <TableCell>{row.status || 'ACTIVE'}</TableCell>
                <TableCell>{row.remarks || '-'}</TableCell>
                {!disabled && (
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton type="button" onClick={() => openEditDialog(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton type="button" color="error" onClick={() => onDelete(row)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function equipmentSummary(equipment) {
  return {
    equipmentCode: equipment?.equipmentCode,
    equipmentName: equipment?.equipmentName,
  };
}

function formatEquipment(row) {
  if (!row?.equipmentName && !row?.equipmentCode) return '-';
  if (!row.equipmentCode) return row.equipmentName;
  if (!row.equipmentName) return row.equipmentCode;
  return `${row.equipmentCode} - ${row.equipmentName}`;
}
