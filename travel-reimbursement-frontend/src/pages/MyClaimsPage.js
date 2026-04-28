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
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getMyClaimsById } from '../services/api';

function MyClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await getMyClaimsById(user.userId);
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClaim(null);
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
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
                      <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ${claim.amount?.toFixed(2)}
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
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(claim)}
                      >
                        View
                      </Button>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Description
                </Typography>
                <Typography variant="body2">{selectedClaim?.description}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${selectedClaim?.amount?.toFixed(2)}
                </Typography>
              </Box>
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
              {selectedClaim?.rejectionReason && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Rejection Reason
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                    {selectedClaim.rejectionReason}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Created
                </Typography>
                <Typography variant="body2">
                  {selectedClaim?.createdAt ? new Date(selectedClaim.createdAt).toLocaleString() : '-'}
                </Typography>
              </Box>
              {selectedClaim?.approvedAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Approved
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedClaim.approvedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {selectedClaim?.paidAt && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Paid
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedClaim.paidAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyClaimsPage;
