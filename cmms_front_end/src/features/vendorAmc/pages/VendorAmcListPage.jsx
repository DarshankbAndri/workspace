import React from 'react';
import { Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CommonList from '../../../shared/components/common/CommonList';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { deleteVendorAmcContract, searchVendorAmcContracts } from '../services/vendorAmcService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

const statusOptions = ['DRAFT', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED']
  .map((status) => ({ value: status, label: status.replaceAll('_', ' ') }));

function VendorAmcListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);
  const [deleteId, setDeleteId] = React.useState(null);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const payload = createSearchPayload({
      filters: [commonSearchFilter(search), equalFilter('status', status)],
      paginationModel,
      sortModel,
    });
    searchVendorAmcContracts(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load AMC contracts.'))
      .finally(() => setLoading(false));
  }, [paginationModel, search, sortModel, status]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const confirmDelete = async () => {
    try {
      await deleteVendorAmcContract(deleteId);
      setDeleteId(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete AMC contract.');
    }
  };

  const columns = [
    { field: 'contractNumber', headerName: 'Contract No.', minWidth: 150, flex: 0.8 },
    { field: 'contractName', headerName: 'Contract', minWidth: 220, flex: 1.2 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 1 },
    { field: 'startDate', headerName: 'Start', minWidth: 120, flex: 0.6 },
    { field: 'endDate', headerName: 'End', minWidth: 120, flex: 0.6 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 140,
      flex: 0.7,
      renderCell: ({ value }) => <Chip size="small" label={formatLabel(value)} color={statusColor(value)} variant="outlined" />,
    },
    { field: 'coveredEquipmentCount', headerName: 'Equipment', minWidth: 110, flex: 0.5 },
    { field: 'contractValue', headerName: 'Value', minWidth: 120, flex: 0.7, valueFormatter: ({ value }) => formatMoney(value) },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View"><IconButton onClick={() => navigate(`/vendor-amc/view/${row.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
          {hasPermission(PERMISSIONS.VENDOR_AMC_UPDATE) && <Tooltip title="Edit"><IconButton onClick={() => navigate(`/vendor-amc/edit/${row.id}`)}><Edit fontSize="small" /></IconButton></Tooltip>}
          {hasPermission(PERMISSIONS.VENDOR_AMC_DELETE) && <Tooltip title="Delete"><IconButton color="error" onClick={() => setDeleteId(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <CommonList
        title="Vendor AMC"
        subtitle="Manage vendor annual maintenance contracts and equipment coverage."
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        addLabel="Create AMC"
        onAdd={() => navigate('/vendor-amc/create')}
        canAdd={hasPermission(PERMISSIONS.VENDOR_AMC_CREATE)}
        searchValue={search}
        onSearchChange={(event) => { setSearch(event.target.value); resetPage(); }}
        filters={(
          <CommonDropdown
            label="Status"
            value={status}
            options={statusOptions}
            onChange={(event) => { setStatus(event.target.value); resetPage(); }}
            clearable
            sx={{ minWidth: 220 }}
          />
        )}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: setPaginationModel,
          sortModel,
          onSortModelChange: setSortModel,
          onRowDoubleClick: ({ row }) => navigate(`/vendor-amc/view/${row.id}`),
        }}
      />
      <ConfirmDialog open={Boolean(deleteId)} handleClose={() => setDeleteId(null)} title="Delete AMC contract?" message="Historical AMC contracts linked to requests cannot be deleted." handleAgree={confirmDelete} closebtn="Cancel" agreebtn="Delete" />
    </>
  );
}

function formatLabel(value) {
  return value ? String(value).replaceAll('_', ' ') : '-';
}

function statusColor(value) {
  if (value === 'ACTIVE') return 'success';
  if (value === 'EXPIRING_SOON') return 'warning';
  if (value === 'EXPIRED' || value === 'TERMINATED') return 'error';
  return 'default';
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default VendorAmcListPage;
