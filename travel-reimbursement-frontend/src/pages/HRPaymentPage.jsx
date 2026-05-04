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
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PaymentOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getPendingClaimsByManager, markClaimAsPaid } from '../services/api';

function HRPaymentPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovedClaims();
  }, []);

  const fetchApprovedClaims = async () => {
    try {
      setLoading(true);
      // For HR, we'll get all pending manager approval claims (those ready to be marked as paid)
      // In a real app, we'd have a specific endpoint for HR-level claims
      const response = await getPendingClaimsByManager(user.id);
      // Filter for APPROVED status (those that are ready to be paid)
      // For demo purposes, we'll show all
      setClaims(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load claims. Please try again.');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = (claim) => {
    setSelectedClaim(claim);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClaim(null);
  };

  const handleMarkAsPaid = async () => {
    setSubmitting(true);
    try {
      await markClaimAsPaid(selectedClaim.id, user.id);
      setSuccessMessage(`✅ Claim #${selectedClaim.id} marked as paid!`);
      handleCloseDialog();
      setTimeout(() => {
        fetchApprovedClaims();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError('Failed to mark claim as paid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      APPROVED: 'success',
      MANAGER_APPROVED: 'warning',
      PAID: 'success',
      REJECTED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      APPROVED: 'Approved',
      MANAGER_APPROVED: 'Manager Approved',
      PAID: 'Paid',
      REJECTED: 'Rejected',
    };
    return labels[status] || status;
  };

  // Filter for APPROVED claims only
  const approvedClaims = claims.filter((claim) => claim.status === 'APPROVED' || claim.status === 'MANAGER_APPROVED');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingY: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
            Payment Processing
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Mark approved claims as paid
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ marginBottom: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ marginBottom: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, marginBottom: 3 }}>
          <Paper sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              {approvedClaims.length}
            </Typography>
            <Typography variant="caption">Ready for Payment</Typography>
          </Paper>
          <Paper sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              ${approvedClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0).toFixed(2)}
            </Typography>
            <Typography variant="caption">Total Amount</Typography>
          </Paper>
          <Paper sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
              {claims.filter((c) => c.status === 'PAID').length}
            </Typography>
            <Typography variant="caption">Already Paid</Typography>
          </Paper>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : approvedClaims.length === 0 ? (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No claims ready for payment processing
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Approved Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedClaims.map((claim) => (
                  <TableRow key={claim.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>#{claim.id}</TableCell>
                    <TableCell>
                      {claim.user?.firstName} {claim.user?.lastName}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {claim.approvedAt ? new Date(claim.approvedAt).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {claim.status !== 'PAID' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<PaymentOutlined />}
                          onClick={() => handleOpenPaymentDialog(claim)}
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        <Chip label="Paid" color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Payment Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            💳 Mark Claim as Paid
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Claim ID
                </Typography>
                <Typography variant="body2">#{selectedClaim?.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Employee
                </Typography>
                <Typography variant="body2">
                  {selectedClaim?.user?.firstName} {selectedClaim?.user?.lastName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  ${selectedClaim?.amount?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Description
                </Typography>
                <Typography variant="body2">{selectedClaim?.description}</Typography>
              </Box>
              <Paper sx={{ padding: 2, backgroundColor: '#e8f5e9', border: '1px solid #81c784' }}>
                <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                  <strong>✓</strong> Once marked as paid, the claim status will be updated and the employee will be notified.
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              variant="contained"
              color="success"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} sx={{ marginRight: 1 }} /> : null}
              Mark as Paid
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default HRPaymentPage;
