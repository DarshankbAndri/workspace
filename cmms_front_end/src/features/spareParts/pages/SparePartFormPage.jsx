import React from 'react';
import { Alert, Box, Button, Chip, Divider, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
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
        .then((data) => setBomRows(data || []))
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
      return;
    }
    const duplicate = bomRows.some((row) => (
      String(row.equipmentId) === String(bomForm.equipmentId)
      && String(row.bomId || row.localId) !== String(editingBomId || '')
    ));
    if (duplicate) {
      setError('This equipment is already linked to this spare part BOM.');
      return;
    }
    const selectedEquipment = equipments.find((equipment) => String(equipment.id) === String(bomForm.equipmentId));
    const payload = {
      ...bomForm,
      equipmentId: Number(bomForm.equipmentId),
      recommendedQty: Number(bomForm.recommendedQty || 0),
    };
    try {
      if (isEdit) {
        if (editingBomId) {
          const saved = await updateSparePartEquipmentBom(id, editingBomId, payload);
          setBomRows((current) => current.map((row) => (row.bomId === editingBomId ? saved : row)));
        } else {
          const saved = await createSparePartEquipmentBom(id, payload);
          setBomRows((current) => [...current, saved]);
        }
      } else if (editingBomId) {
        setBomRows((current) => current.map((row) => (row.localId === editingBomId ? { ...row, ...payload, ...equipmentSummary(selectedEquipment) } : row)));
      } else {
        setBomRows((current) => [
          ...current,
          { ...payload, ...equipmentSummary(selectedEquipment), localId: `new-${Date.now()}-${Math.random()}` },
        ]);
      }
      resetBomForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save linked equipment BOM.');
    }
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

  const handleDeleteBomRow = async (row) => {
    setError('');
    try {
      if (isEdit && row.bomId) {
        await deleteSparePartEquipmentBom(id, row.bomId);
      }
      setBomRows((current) => current.filter((item) => (item.bomId || item.localId) !== (row.bomId || row.localId)));
      if (editingBomId === (row.bomId || row.localId)) resetBomForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete linked equipment BOM.');
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
      } else {
        const saved = await createSparePart(payload);
        const stockId = saved?.id || saved?.stockId;
        for (const row of bomRows) {
          await createSparePartEquipmentBom(stockId, {
            equipmentId: Number(row.equipmentId),
            recommendedQty: Number(row.recommendedQty || 0),
            criticality: row.criticality || 'MEDIUM',
            replacementFrequency: row.replacementFrequency || '',
            status: row.status || 'ACTIVE',
            remarks: row.remarks || '',
          });
        }
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
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" fontWeight={800}>Linked Equipment BOM</Typography>
      {!disabled && (
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={3}>
            <CommonDropdown required disabled={equipmentDisabled} label="Equipment" value={form.equipmentId} onChange={onFieldChange('equipmentId')} options={equipmentOptions} />
          </Grid>
          <Grid item xs={12} md={2}>
            <CommonInput required type="number" label="Recommended Qty" value={form.recommendedQty} onChange={onFieldChange('recommendedQty')} />
          </Grid>
          <Grid item xs={12} md={2}>
            <CommonDropdown label="Criticality" value={form.criticality} onChange={onFieldChange('criticality')} options={BOM_CRITICALITY_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={2}>
            <CommonInput label="Replacement Frequency" value={form.replacementFrequency || ''} onChange={onFieldChange('replacementFrequency')} />
          </Grid>
          <Grid item xs={12} md={2}>
            <CommonDropdown label="Status" value={form.status} onChange={onFieldChange('status')} options={BOM_STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={9}>
            <CommonTextArea minRows={1} label="Remarks" value={form.remarks || ''} onChange={onFieldChange('remarks')} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {editingBomId && <Button variant="outlined" onClick={onCancel}>Cancel</Button>}
              <Button variant="contained" startIcon={<Add />} onClick={onSave}>{editingBomId ? 'Update Link' : 'Add Link'}</Button>
            </Stack>
          </Grid>
        </Grid>
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
                    <Tooltip title="Edit"><IconButton onClick={() => onEdit(row)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton color="error" onClick={() => onDelete(row)}><Delete fontSize="small" /></IconButton></Tooltip>
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
