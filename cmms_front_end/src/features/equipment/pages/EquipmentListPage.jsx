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
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonList from '../../../shared/components/common/CommonList';
import CommonFilterPanel from '../../../shared/components/common/CommonFilterPanel';
import CommonPageHeader from '../../../shared/components/common/CommonPageHeader';
import CommonStatusChip from '../../../shared/components/common/CommonStatusChip';

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
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.6, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
    { field: 'lifecycleStatus', headerName: 'Lifecycle', minWidth: 160, flex: 0.75, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
    { field: 'operatingStatus', headerName: 'Operating', minWidth: 170, flex: 0.8, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
    { field: 'criticality', headerName: 'Criticality', minWidth: 130, flex: 0.7, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
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
      <CommonPageHeader
        title="Equipment"
        subtitle="Maintain plant assets and operating status."
        primaryAction={hasPermission(PERMISSIONS.EQUIPMENT_CREATE) ? {
          label: 'Add Equipment',
          icon: <Add />,
          onClick: () => navigate('/equipment/new'),
          'data-testid': 'equipment-add-button',
        } : undefined}
        sx={{ mb: 2 }}
        data-testid="equipment-page-header"
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonFilterPanel sx={{ mb: 2 }}>
        <CommonInput
          label="Equipment"
          value={equipmentNameFilter}
          onChange={updateEquipmentNameFilter}
          sx={{ width: { xs: '100%', sm: 280 }, flex: { md: '0 1 280px' } }}
          data-testid="equipment-search-field"
        />
        <CommonDropdown
          label="Site"
          value={siteFilter}
          onChange={updateSiteFilter}
          options={sites}
          placeholder="All Sites"
          clearable
          fullWidth
          getOptionLabel={(site) => `${site.siteName} (${site.siteCode})`}
          getOptionValue={(site) => site.id}
          sx={{ width: { xs: '100%', sm: 280 }, flex: { md: '0 1 280px' } }}
          data-testid="equipment-site-filter"
        />
      </CommonFilterPanel>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        viewPermission={PERMISSIONS.EQUIPMENT_VIEW}
        getRowViewPath={getEquipmentViewPath}
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
        }}
        onRetry={loadRows}
        emptyMessage="No equipment found."
        tableTestId="equipment-table"
      />

      <Dialog
        open={qrDialog.open}
        onClose={() => setQrDialog(initialQrDialog)}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            mx: 2,
            width: 'min(360px, calc(100vw - 32px))',
          },
        }}
      >
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
