import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Stack,
  Collapse,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getMyClaimsById } from '../services/api';

function MyClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [editedClaim, setEditedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await getMyClaimsById(user.id);
      setClaims(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load claims. Please try again.');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      DRAFT: 'default',
      SUBMITTED: 'info',
      PENDING_MANAGER_APPROVAL: 'warning',
      MANAGER_APPROVED: 'info',
      PENDING_HR_APPROVAL: 'info',
      APPROVED: 'success',
      REJECTED: 'error',
      PAID: 'success',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      PENDING_MANAGER_APPROVAL: 'Pending Manager',
      MANAGER_APPROVED: 'Manager Approved',
      PENDING_HR_APPROVAL: 'Pending HR',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      PAID: 'Paid',
    };
    return labels[status] || status;
  };

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
    setEditedClaim({ ...claim });
    setEditMode(false);
    setShowExpenses(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClaim(null);
    setEditedClaim(null);
    setEditMode(false);
    setShowExpenses(false);
  };

  const handleEditToggle = () => {
    setEditMode(true);
    setEditedClaim({ ...selectedClaim });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedClaim({ ...selectedClaim });
  };

  const handleEditChange = (field, value) => {
    setEditedClaim((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (!editedClaim) {
      return;
    }
    const updatedClaims = claims.map((claim) =>
      claim.id === editedClaim.id ? editedClaim : claim
    );
    setClaims(updatedClaims);
    setSelectedClaim(editedClaim);
    setEditMode(false);
  };

  const renderExpenseSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Days</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${title}-${index}`}>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell align="right">{item.amount != null ? `$${Number(item.amount).toFixed(2)}` : '-'}</TableCell>
                <TableCell align="right">{item.days ?? '-'}</TableCell>
                <TableCell align="right">{item.total != null ? `$${Number(item.total).toFixed(2)}` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingY: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
              My Claims
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Track all your submitted claims
            </Typography>
          </div>
          <Button variant="contained" href="/create-claim">
            + New Claim
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: 3 }}>{error}</Alert>}

        {/* Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : claims.length === 0 ? (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No claims found. Create a new claim to get started!
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Route</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>#{claim.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.projectName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.fromLocation ? `${claim.fromLocation} → ${claim.toLocation || '-'}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {claim.amount != null ? `$${claim.amount?.toFixed(2)}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(claim.status)}
                        color={getStatusColor(claim.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(claim)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleViewDetails(claim)}
                        >
                          View Expenses
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Details Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Claim #{selectedClaim?.id} Details
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 2 }}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={editMode ? editedClaim?.projectName ?? '' : selectedClaim?.projectName ?? ''}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('projectName', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Travel Purpose"
                    value={editMode ? editedClaim?.travelPurpose ?? '' : selectedClaim?.travelPurpose ?? ''}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('travelPurpose', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Location"
                    value={editMode ? editedClaim?.fromLocation ?? '' : selectedClaim?.fromLocation ?? ''}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('fromLocation', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Location"
                    value={editMode ? editedClaim?.toLocation ?? '' : selectedClaim?.toLocation ?? ''}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('toLocation', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={editMode ? editedClaim?.travelFromDate ?? '' : selectedClaim?.travelFromDate ?? ''}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('travelFromDate', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="From Time"
                    type="time"
                    value={editMode ? editedClaim?.travelFromTime ?? '' : selectedClaim?.travelFromTime ?? ''}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('travelFromTime', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={editMode ? editedClaim?.travelToDate ?? '' : selectedClaim?.travelToDate ?? ''}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('travelToDate', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="To Time"
                    type="time"
                    value={editMode ? editedClaim?.travelToTime ?? '' : selectedClaim?.travelToTime ?? ''}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ readOnly: !editMode }}
                    onChange={(e) => handleEditChange('travelToTime', e.target.value)}
                    variant={editMode ? 'outlined' : 'filled'}
                    size="small"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                value={editMode ? editedClaim?.description ?? '' : selectedClaim?.description ?? ''}
                InputProps={{ readOnly: !editMode }}
                onChange={(e) => handleEditChange('description', e.target.value)}
                variant={editMode ? 'outlined' : 'filled'}
              />

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Status
                </Typography>
                <Chip
                  label={getStatusLabel(selectedClaim?.status)}
                  color={getStatusColor(selectedClaim?.status)}
                  size="small"
                  sx={{ marginTop: 0.5 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {selectedClaim?.createdAt ? new Date(selectedClaim.createdAt).toLocaleString() : '-'}
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowExpenses((prev) => !prev)}
              >
                {showExpenses ? 'Hide Expenses' : 'View Expenses'}
              </Button>

              <Collapse in={showExpenses}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {renderExpenseSection('Daily Summary', selectedClaim?.dailySummary)}
                  {renderExpenseSection('Hotel', selectedClaim?.hotel)}
                  {renderExpenseSection('Telephone Calls / Internet', selectedClaim?.telephone)}
                  {renderExpenseSection('Taxi', selectedClaim?.taxi)}
                  {renderExpenseSection('Miscellaneous', selectedClaim?.miscellaneous)}
                  {renderExpenseSection('Other Trip Expenses', selectedClaim?.otherExpenses)}
                </Box>
              </Collapse>
            </Stack>
          </DialogContent>
          <DialogActions>
            {editMode ? (
              <>
                <Button onClick={handleCancelEdit}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEditToggle}>Edit</Button>
                <Button onClick={handleCloseDialog}>Close</Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyClaimsPage;
