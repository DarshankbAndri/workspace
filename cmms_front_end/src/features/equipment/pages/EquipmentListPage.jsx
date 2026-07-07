import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  GlobalStyles,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, QrCode2 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { deleteEquipment, searchEquipments } from '../services/equipmentService';
import { getSites } from '../../site/services/siteService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonList from '../../../shared/components/common/CommonList';

const initialQrDialog = { open: false, row: null };

const getEquipmentViewPath = (row) => row?.id ? `/equipment/${row.id}/view` : '';

const getEquipmentQrValue = (row) => {
  const path = getEquipmentViewPath(row);
  if (!path) return '';
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
};

function EquipmentListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [sites, setSites] = React.useState([]);
  const [siteFilter, setSiteFilter] = React.useState('');
  const [equipmentNameFilter, setEquipmentNameFilter] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [qrDialog, setQrDialog] = React.useState(initialQrDialog);
  const qrValue = React.useMemo(() => getEquipmentQrValue(qrDialog.row), [qrDialog.row]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const searchCriteriaList = [];
    if (siteFilter) {
      searchCriteriaList.push({
        filterKey: 'siteId',
        dataType: 'LONG',
        value: siteFilter,
        operation: 'equal',
      });
    }
    if (equipmentNameFilter.trim()) {
      searchCriteriaList.push({
        filterKey: 'commonSearch',
        dataType: 'VARCHAR',
        value: equipmentNameFilter.trim(),
        operation: 'contains',
      });
    }
    const activeSort = sortModel[0];
    searchEquipments({
      searchCriteriaList,
      dataOption: 'all',
      pagination: {
        status: 'ON',
        recordsPerPage: paginationModel.pageSize,
        sortBy: activeSort?.field || null,
        sortMode: activeSort?.sort ? activeSort.sort.toUpperCase() : null,
        pageNumber: paginationModel.page,
        pageSize: 0,
      },
    })
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch(() => setError('Unable to load equipment.'))
      .finally(() => setLoading(false));
  }, [equipmentNameFilter, paginationModel.page, paginationModel.pageSize, siteFilter, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Retire this equipment? Open requests, assignments, PM schedules, or downtime records will block retirement.')) return;
    try {
      await deleteEquipment(id);
      loadRows();
    } catch {
      setError('Unable to retire equipment.');
    }
  };

  const updateSiteFilter = (event) => {
    setSiteFilter(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updateEquipmentNameFilter = (event) => {
    setEquipmentNameFilter(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updatePaginationModel = (model) => {
    setPaginationModel((current) => ({
      page: model.pageSize !== current.pageSize ? 0 : model.page,
      pageSize: model.pageSize,
    }));
  };

  const columns = [
    { field: 'equipmentCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1.2 },
    { field: 'siteName', headerName: 'Site', minWidth: 180, flex: 1 },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.8 },
    { field: 'location', headerName: 'Location', minWidth: 130, flex: 0.8 },
    { field: 'status', headerName: 'Status', minWidth: 110, flex: 0.6 },
    { field: 'lifecycleStatus', headerName: 'Lifecycle', minWidth: 150, flex: 0.75 },
    { field: 'operatingStatus', headerName: 'Operating', minWidth: 160, flex: 0.8 },
    { field: 'criticality', headerName: 'Criticality', minWidth: 120, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="QR label">
            <IconButton
              aria-label="Equipment QR label"
              onClick={(event) => {
                event.stopPropagation();
                setQrDialog({ open: true, row });
              }}
            >
              <QrCode2 fontSize="small" />
            </IconButton>
          </Tooltip>
          {hasPermission(PERMISSIONS.EQUIPMENT_DELETE) && (
            <IconButton
              aria-label="Retire equipment"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(row.id);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Equipment</Typography>
          <Typography variant="body2" color="text.secondary">Maintain plant assets and operating status.</Typography>
        </Box>
        {hasPermission(PERMISSIONS.EQUIPMENT_CREATE) && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/equipment/new')}>Add Equipment</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Equipment" value={equipmentNameFilter} onChange={updateEquipmentNameFilter} sx={{ minWidth: { xs: '100%', sm: 280 } }} />
          <CommonDropdown
            label="Site"
            value={siteFilter}
            onChange={updateSiteFilter}
            options={sites}
            placeholder="All Sites"
            clearable
            getOptionLabel={(site) => `${site.siteName} (${site.siteCode})`}
            getOptionValue={(site) => site.id}
            sx={{ minWidth: { xs: '100%', sm: 280 } }}
          />
        </Stack>
      </Paper>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: updatePaginationModel,
          sortModel,
          onSortModelChange: (model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          },
          onRowClick: ({ row }) => navigate(`/equipment/${row.id}/view`),
          sx: {
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          },
        }}
      />

      <Dialog open={qrDialog.open} onClose={() => setQrDialog(initialQrDialog)} maxWidth="xs" fullWidth>
        <GlobalStyles
          styles={{
            '@media print': {
              'body *': { visibility: 'hidden' },
              '.equipment-qr-print-area, .equipment-qr-print-area *': { visibility: 'visible' },
              '.equipment-qr-print-area': {
                background: '#fff',
                color: '#000',
                left: 0,
                padding: '6mm',
                position: 'fixed',
                top: 0,
                width: '72mm',
              },
            },
          }}
        />
        <DialogTitle>Equipment QR Label</DialogTitle>
        <DialogContent>
          <Stack
            className="equipment-qr-print-area"
            spacing={1.5}
            alignItems="center"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              color: 'text.primary',
              mx: 'auto',
              p: 2,
              width: 280,
            }}
          >
            <Typography variant="overline" fontWeight={900} sx={{ lineHeight: 1 }}>CMMS Equipment</Typography>
            {qrDialog.row && qrValue && (
              <QRCodeSVG
                value={qrValue}
                size={190}
                level="H"
                marginSize={2}
                title={`Open ${qrDialog.row.equipmentCode || 'equipment'} in CMMS`}
              />
            )}
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ overflowWrap: 'anywhere' }}>{qrDialog.row?.equipmentCode}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{qrDialog.row?.equipmentName}</Typography>
              <Divider sx={{ my: 1.25 }} />
              <Stack spacing={0.75} sx={{ textAlign: 'left' }}>
                <Typography variant="caption"><strong>Site:</strong> {qrDialog.row?.siteName || '-'}</Typography>
                <Typography variant="caption"><strong>Location:</strong> {qrDialog.row?.location || 'Not assigned'}</Typography>
                <Typography variant="caption"><strong>Criticality:</strong> {qrDialog.row?.criticality || '-'}</Typography>
                <Typography variant="caption"><strong>Status:</strong> {qrDialog.row?.status || '-'}</Typography>
                <Typography variant="caption"><strong>Operating:</strong> {qrDialog.row?.operatingStatus || '-'}</Typography>
              </Stack>
              <Divider sx={{ my: 1.25 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                {qrValue}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          {qrDialog.row && <Button onClick={() => navigate(getEquipmentViewPath(qrDialog.row))}>Open</Button>}
          <Button onClick={() => window.print()}>Print</Button>
          <Button onClick={() => setQrDialog(initialQrDialog)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EquipmentListPage;
