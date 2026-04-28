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
  TextField,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getPendingClaimsByManager, approveClaim, rejectClaim } from '../services/api';

function ManagerApprovalPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      setLoading(true);
      const response = await getPendingClaimsByManager(user.userId);
      setClaims(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load pending claims. Please try again.');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApprovalDialog = (claim, action) => {
    setSelectedClaim(claim);
    setDialogAction(action);
    setComments('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClaim(null);
    setDialogAction(null);
    setComments('');
  };

  const handleApprove = async () => {
    if (!comments.trim()) {
      setError('Please add comments before approving');
      return;
    }

    setSubmitting(true);
    try {
      await approveClaim(selectedClaim.id, user.userId, { comments });
      setSuccessMessage('✅ Claim approved successfully!');
      handleCloseDialog();
      setTimeout(() => {
        fetchPendingClaims();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError('Failed to approve claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      setError('Please add rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      await rejectClaim(selectedClaim.id, user.userId, { comments });
      setSuccessMessage('❌ Claim rejected');
      handleCloseDialog();
      setTimeout(() => {
        fetchPendingClaims();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError('Failed to reject claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingY: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
            Pending Approvals
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Review and approve travel reimbursement claims from your team
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

        {/* Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : claims.length === 0 ? (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No pending claims for approval
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
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
                      <Typography variant="caption">
                        {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleOpenApprovalDialog(claim, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleOpenApprovalDialog(claim, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Approval Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {dialogAction === 'approve' ? '✅ Approve' : '❌ Reject'} Claim #{selectedClaim?.id}
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
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
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${selectedClaim?.amount?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Description
                </Typography>
                <Typography variant="body2">{selectedClaim?.description}</Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={dialogAction === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                dialogAction === 'approve'
                  ? 'Add your approval comments...'
                  : 'Explain why you are rejecting this claim...'
              }
              disabled={submitting}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={dialogAction === 'approve' ? handleApprove : handleReject}
              variant="contained"
              color={dialogAction === 'approve' ? 'success' : 'error'}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} sx={{ marginRight: 1 }} /> : null}
              {dialogAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ManagerApprovalPage;
