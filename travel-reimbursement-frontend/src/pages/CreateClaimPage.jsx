import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Input,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { createClaim } from '../services/api';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Close as CloseIcon, AttachFile as AttachFileIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';

const createLineItem = () => ({ id: `${Date.now()}-${Math.random()}`, description: '', amount: '', days: '' });

const sectionDefinitions = [
  { key: 'dailySummary', title: 'Daily Summary' },
  { key: 'hotel', title: 'Hotel' },
  { key: 'telephone', title: 'Telephone Calls / Internet' },
  { key: 'taxi', title: 'Taxi' },
  { key: 'miscellaneous', title: 'Miscellaneous' },
  { key: 'otherExpenses', title: 'Other Trip Expenses' },
];

function CreateClaimPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [basicDetails, setBasicDetails] = useState({
    projectName: '',
    travelPurpose: '',
    travelFromDateTime: '',
    travelToDateTime: '',
    fromLocation: '',
    toLocation: '',
  });

  const [sections, setSections] = useState({
    dailySummary: [createLineItem()],
    hotel: [createLineItem()],
    telephone: [createLineItem()],
    taxi: [createLineItem()],
    miscellaneous: [createLineItem()],
    otherExpenses: [createLineItem()],
  });

  const [documents, setDocuments] = useState({
    dailySummary: [],
    hotel: [],
    telephone: [],
    taxi: [],
    miscellaneous: [],
    otherExpenses: [],
  });

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmRemoveSection, setConfirmRemoveSection] = useState('');
  const [confirmRemoveIndex, setConfirmRemoveIndex] = useState(null);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (section, index, field, value) => {
    setSections((prev) => {
      const updatedItems = [...prev[section]];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, [section]: updatedItems };
    });
  };

  const addSectionItem = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: [...prev[section], createLineItem()],
    }));
  };

  const removeSectionItem = (section, index) => {
    setSections((prev) => {
      const updatedItems = [...prev[section]];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        [section]: updatedItems.length > 0 ? updatedItems : [createLineItem()],
      };
    });
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
    setDocuments((prev) => ({
      ...prev,
      [currentSection]: [...(prev[currentSection] || []), newDoc],
    }));
    handleCloseUpload();
  };

  const handleOpenConfirmRemove = (section, index) => {
    setConfirmRemoveSection(section);
    setConfirmRemoveIndex(index);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
    setConfirmRemoveSection('');
    setConfirmRemoveIndex(null);
  };

  const handleConfirmRemove = () => {
    if (confirmRemoveSection && confirmRemoveIndex != null) {
      setDocuments((prev) => ({
        ...prev,
        [confirmRemoveSection]: prev[confirmRemoveSection].filter((_, i) => i !== confirmRemoveIndex),
      }));
    }
    handleCloseConfirm();
  };

  const handleRemoveDocument = (section, index) => {
    setDocuments((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const formatCurrency = (value) => {
    const amount = parseFloat(value);
    return Number.isNaN(amount) ? '0.00' : amount.toFixed(2);
  };

  const getLineTotal = (item) => {
    const amount = parseFloat(item.amount) || 0;
    const days = parseInt(item.days, 10) || 0;
    return (amount * days).toFixed(2);
  };

  const computeTotalAmount = () => {
    return Object.values(sections).reduce((total, sectionItems) => {
      return total + sectionItems.reduce((sectionSum, item) => {
        const amount = parseFloat(item.amount) || 0;
        const days = parseInt(item.days, 10) || 0;
        return sectionSum + amount * days;
      }, 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!basicDetails.projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    if (!basicDetails.fromLocation.trim() || !basicDetails.toLocation.trim()) {
      setError('Travel origin and destination are required.');
      return;
    }

    if (!user?.id) {
      setError('User authentication data is missing. Please log in again.');
      return;
    }

    const totalAmount = computeTotalAmount();
    if (totalAmount <= 0) {
      setError('Please add at least one expense entry with amount and days.');
      return;
    }

    const claimPayload = {
      projectName: basicDetails.projectName,
      travelPurpose: basicDetails.travelPurpose,
      travelFromDate: basicDetails.travelFromDateTime ? basicDetails.travelFromDateTime.split('T')[0] : '',
      travelFromTime: basicDetails.travelFromDateTime ? basicDetails.travelFromDateTime.split('T')[1] : '',
      travelToDate: basicDetails.travelToDateTime ? basicDetails.travelToDateTime.split('T')[0] : '',
      travelToTime: basicDetails.travelToDateTime ? basicDetails.travelToDateTime.split('T')[1] : '',
      fromLocation: basicDetails.fromLocation,
      toLocation: basicDetails.toLocation,
      description: basicDetails.travelPurpose || basicDetails.projectName || 'Travel claim',
      amount: totalAmount.toFixed(2),
      dailySummary: sections.dailySummary.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      hotel: sections.hotel.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      telephone: sections.telephone.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      taxi: sections.taxi.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      miscellaneous: sections.miscellaneous.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      otherExpenses: sections.otherExpenses.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
    };

    setLoading(true);
    try {
      await createClaim(user.id, claimPayload);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('Failed to save claim. Please try again.');
      console.error('Create claim error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Create New Travel Claim
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Enter travel details and add expense entries for each category.
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
              ✅ Claim form updated locally. Backend integration will be added later.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                1. Trip Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="projectName"
                    value={basicDetails.projectName}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Travel Purpose"
                    name="travelPurpose"
                    value={basicDetails.travelPurpose || ''}
                    onChange={handleBasicChange}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Travel From"
                    name="travelFromDateTime"
                    type="datetime-local"
                    value={basicDetails.travelFromDateTime}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Travel To"
                    name="travelToDateTime"
                    type="datetime-local"
                    value={basicDetails.travelToDateTime}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Location"
                    name="fromLocation"
                    value={basicDetails.fromLocation}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Location"
                    name="toLocation"
                    value={basicDetails.toLocation}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Paper>

            {sectionDefinitions.map((section) => (
              <Paper key={section.key} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{section.title}</Typography>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => addSectionItem(section.key)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      Add entry
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenUpload(section.key)}
                      disabled={loading}
                    >
                      Upload Document
                    </Button>
                  </Box>
                </Box>

                {sections[section.key].map((item, index) => (
                  <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: index !== sections[section.key].length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={item.description}
                          onChange={(e) => handleSectionChange(section.key, index, 'description', e.target.value)}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleSectionChange(section.key, index, 'amount', e.target.value)}
                          inputProps={{ step: '0.01', min: '0' }}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="No. Days"
                          type="number"
                          value={item.days}
                          onChange={(e) => handleSectionChange(section.key, index, 'days', e.target.value)}
                          inputProps={{ step: '1', min: '0' }}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Total"
                          value={`$${getLineTotal(item)}`}
                          InputProps={{ readOnly: true }}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeSectionItem(section.key, index)}
                          disabled={loading}
                          aria-label="Remove entry"
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}

                {documents[section.key] && documents[section.key].length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {documents[section.key].map((doc, index) => (
                      <Box key={index} sx={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            backgroundColor: '#f9f9f9',
                          }}
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          {doc.file.type.startsWith('image/') ? (
                            <img
                              src={doc.url}
                              alt={doc.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <PdfIcon sx={{ fontSize: 32, color: '#d32f2f' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.name}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -11,
                            right: -11,
                            border: 'none',
                            color: '#0e0d0d',
                            minWidth: 'auto',
                            padding: '4px',
                          }}
                          onClick={() => handleOpenConfirmRemove(section.key, index)}
                        >
                          <CloseIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            ))}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Saving...' : 'Save Claim UI'}
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>

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

        <ConfirmDialog
          open={confirmDialogOpen}
          handleClose={handleCloseConfirm}
          title="Remove document"
          message="Are you sure you want to remove this document?"
          handleAgree={handleConfirmRemove}
          closebtn="Cancel"
          agreebtn="Remove"
        />
      </Container>
    </Box>
  );
}

export default CreateClaimPage;
