import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material/';
import { downloadDocument, viewDocument } from '../services/api';

function DocumentPreview({ open, onClose, document, documents, entryType = 'daily' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  const currentDoc = documents?.[currentIndex];

  // Load image preview when document changes
  useEffect(() => {
    setImagePreview(null);
    setError('');
    
    if (currentDoc && isImage() && documents) {
      loadImagePreview();
    }
  }, [currentIndex, documents]);

  const loadImagePreview = async () => {
    if (!currentDoc) return;
    
    try {
      setLoading(true);
      console.log('Loading preview for:', currentDoc.id);
      const response = await viewDocument(currentDoc.id, entryType);
      
      // response.data is already a Blob when responseType: 'blob' is set
      console.log('Response type:', typeof response.data, response.data instanceof Blob);
      
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      console.log('Preview URL created:', url);
      setImagePreview(url);
    } catch (err) {
      console.error('Error loading image preview:', err);
      if (err.response?.data) {
        console.error('Error response:', err.response.data);
      }
      setError('Failed to load image preview');
    } finally {
      setLoading(false);
    }
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? documents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === documents.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    if (!currentDoc) return;
    
    try {
      setLoading(true);
      console.log('Downloading document:', currentDoc.id, 'Entry type:', entryType);
      const response = await downloadDocument(currentDoc.id, entryType);
      
      console.log('Response received:', response);
      console.log('Response data type:', typeof response.data, 'Is Blob:', response.data instanceof Blob);
      
      // response.data is already a Blob when responseType: 'blob' is set
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      console.log('Blob size:', blob.size, 'bytes, Type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Empty file received');
      }
      
      // Create object URL and trigger download
      const url = URL.createObjectURL(blob);
      console.log('Object URL created:', url);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.download = currentDoc.fileName || 'document';
      link.style.display = 'none';
      
      console.log('Appending link to body and triggering click...');
      window.document.body.appendChild(link);
      link.click();
      
      console.log('Click triggered, waiting 100ms before cleanup...');
      
      // Wait a bit before cleanup to ensure click completes
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
        console.log('Download cleanup completed');
      }, 100);
      
      console.log('Download initiated successfully');
    } catch (err) {
      console.error('Error downloading document:', err);
      console.error('Error stack:', err.stack);
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
      }
      setError(`Failed to download document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = async () => {
    if (!currentDoc) return;
    
    try {
      setLoading(true);
      console.log('Opening document in new tab:', currentDoc.id);
      const response = await viewDocument(currentDoc.id, entryType);
      
      // response.data is already a Blob when responseType: 'blob' is set
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      console.log('Blob created:', blob.size, 'bytes');
      
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      console.log('Document opened in new tab');
    } catch (err) {
      console.error('Error opening document:', err);
      if (err.response?.data) {
        console.error('Error response:', err.response.data);
      }
      setError('Failed to open document');
    } finally {
      setLoading(false);
    }
  };

  const isImage = () => {
    if (!currentDoc || !currentDoc.fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some((ext) => currentDoc.fileName.toLowerCase().endsWith(ext));
  };

  const isPdf = () => {
    if (!currentDoc || !currentDoc.fileName) return false;
    return currentDoc.fileName.toLowerCase().endsWith('.pdf');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {currentDoc?.documentName || 'Document'} ({currentIndex + 1} of {documents.length})
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400 }}>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        
        {loading && <CircularProgress sx={{ mt: 4 }} />}

        {!loading && !error && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {isImage() && imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                alt={currentDoc.documentName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  borderRadius: 1,
                  objectFit: 'contain',
                  mb: 2,
                }}
              />
            )}

            {isPdf() && (
              <Paper
                sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0',
                  mb: 2,
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Typography variant="h6" color="text.secondary">
                    📄 PDF Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentDoc.fileName}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={handleOpenInNewTab}
                      startIcon={<OpenInNewIcon />}
                    >
                      View in New Tab
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleDownload}
                      startIcon={<DownloadIcon />}
                    >
                      Download PDF
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}

            {!isImage() && !isPdf() && (
              <Paper
                sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f0f0',
                  mb: 2,
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  📎 File: {currentDoc?.fileName}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                >
                  Download File
                </Button>
              </Paper>
            )}

            {/* Document Info */}
            <Box sx={{ width: '100%', mb: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Document Name
                  </Typography>
                  <Typography variant="body2">{currentDoc?.documentName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    File Name
                  </Typography>
                  <Typography variant="body2">{currentDoc?.fileName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded
                  </Typography>
                  <Typography variant="body2">
                    {currentDoc?.uploadedAt ? new Date(currentDoc.uploadedAt).toLocaleString() : '-'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Button onClick={handlePrevious} disabled={documents.length === 1}>
            ← Previous
          </Button>
          <Button onClick={handleNext} disabled={documents.length === 1}>
            Next →
          </Button>
        </Box>

        <Box>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />} sx={{ mr: 1 }} disabled={loading}>
            Download
          </Button>
          <Button onClick={onClose} variant="contained" disabled={loading}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default DocumentPreview;
