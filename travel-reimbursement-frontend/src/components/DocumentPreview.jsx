import React, { useState } from 'react';
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
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material/';

function DocumentPreview({ open, onClose, document, documents }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!documents || documents.length === 0) {
    return null;
  }

  const currentDoc = documents[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? documents.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === documents.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = () => {
    if (currentDoc && currentDoc.filePath) {
      window.open(`http://localhost:8080${currentDoc.filePath}`, '_blank');
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
        {loading && <CircularProgress sx={{ mt: 4 }} />}

        {!loading && (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {isImage() && (
              <Box
                component="img"
                src={`http://localhost:8080${currentDoc.filePath}`}
                alt={currentDoc.documentName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  borderRadius: 1,
                  objectFit: 'contain',
                  mb: 2,
                }}
                onLoad={() => setLoading(false)}
                onLoadStart={() => setLoading(true)}
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
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    PDF Document
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleDownload}
                    startIcon={<DownloadIcon />}
                  >
                    Download PDF
                  </Button>
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
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  File: {currentDoc?.fileName}
                </Typography>
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
          <Button onClick={handleDownload} startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
            Download
          </Button>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default DocumentPreview;
