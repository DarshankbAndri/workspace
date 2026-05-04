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
  IconButton,
  Input,
} from '@mui/material';
import { Close as CloseIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
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
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

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
    const claimWithDocs = {
      ...claim,
      documents: claim.documents || {
        dailySummary: [],
        hotel: [],
        telephone: [],
        taxi: [],
        miscellaneous: [],
        otherExpenses: [],
      },
    };
    setSelectedClaim(claimWithDocs);
    setEditedClaim({ ...claimWithDocs });
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

  const handleOpenUpload = (section) => {
    setCurrentSection(section);
    setDocumentName('');
    setSelectedFile(null);
    setOpenUploadDialog(true);
  };

  const handleCloseUpload = () => {
    setOpenUploadDialog(false);
    setCurrentSection('');
    setDocumentName('');
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
    } else {
      alert('Please select an image or PDF file.');
    }
  };

  const handleUploadDocument = () => {
    if (!documentName.trim() || !selectedFile) {
      alert('Please provide a document name and select a file.');
      return;
    }
    const newDoc = {
      name: documentName,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile), // For preview
    };
    setEditedClaim((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [currentSection]: [...(prev.documents[currentSection] || []), newDoc],
      },
    }));
    handleCloseUpload();
  };

  const handleRemoveDocument = (section, index) => {
    setEditedClaim((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [section]: prev.documents[section].filter((_, i) => i !== index),
      },
    }));
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

  const renderExpenseSection = (title, items, sectionKey) => {
    if (!items || items.length === 0) return null;

    const documents = editedClaim?.documents?.[sectionKey] || [];

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => handleOpenUpload(sectionKey)}>
            Upload Document
          </Button>
        </Box>
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
        {documents.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {documents.map((doc, index) => (
              <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                <Chip
                  icon={<AttachFileIcon />}
                  label={doc.name}
                  size="small"
                  onClick={() => window.open(doc.url, '_blank')}
                  sx={{ cursor: 'pointer' }}
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'white', border: '1px solid #ccc' }}
                  onClick={() => handleRemoveDocument(sectionKey, index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
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
                  {renderExpenseSection('Daily Summary', selectedClaim?.dailySummary, 'dailySummary')}
                  {renderExpenseSection('Hotel', selectedClaim?.hotel, 'hotel')}
                  {renderExpenseSection('Telephone Calls / Internet', selectedClaim?.telephone, 'telephone')}
                  {renderExpenseSection('Taxi', selectedClaim?.taxi, 'taxi')}
                  {renderExpenseSection('Miscellaneous', selectedClaim?.miscellaneous, 'miscellaneous')}
                  {renderExpenseSection('Other Trip Expenses', selectedClaim?.otherExpenses, 'otherExpenses')}
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

        {/* Upload Document Dialog */}
        <Dialog open={openUploadDialog} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                size="small"
              />
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                inputProps={{ 'aria-label': 'Upload file' }}
              />
              {selectedFile && (
                <Typography variant="body2">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpload}>Cancel</Button>
            <Button variant="contained" onClick={handleUploadDocument}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyClaimsPage;
