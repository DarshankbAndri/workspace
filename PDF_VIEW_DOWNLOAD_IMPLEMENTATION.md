# PDF View and Download Implementation - Summary

## Overview
Successfully implemented complete PDF viewing and file downloading functionality for the My Claims page. Users can now preview PDFs, images, and download any document from their travel claims.

---

## Backend Changes

### 1. **DocumentController.java** - Added File Serving Endpoints

#### New Dependencies
```java
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
```

#### New Endpoints

**GET `/api/documents/download/{documentId}` - Download File**
- Query param: `entryType` (daily, hotel, telephone, taxi, miscellaneous, other)
- Returns: File as attachment (triggers browser download)
- Status: 200 OK with file content
- Content-Type: Determined by file extension (PDF, PNG, JPEG, etc.)

**GET `/api/documents/view/{documentId}` - View File Inline**
- Query param: `entryType` (daily, hotel, telephone, taxi, miscellaneous, other)
- Returns: File as inline content (opens in browser)
- Status: 200 OK with file content
- Content-Type: Determined by file extension

**Helper Method: `determineContentType(String fileName)`**
- Supports: PDF, PNG, JPEG, GIF, WebP
- Falls back to APPLICATION_OCTET_STREAM for unknown types

### 2. **DocumentService.java** - Added Download Logic

#### New Public Method
```java
public FileDownloadResponse downloadDocument(Long documentId, String entryType) throws IOException
```
- Retrieves document metadata from database (by entry type)
- Fetches file content from disk using FileStorageService
- Returns FileDownloadResponse with file name and content (bytes)
- Supports all 6 expense entry types

#### New Inner Class
```java
public static class FileDownloadResponse {
    private final String fileName;
    private final byte[] content;
    
    // getters
}
```

---

## Frontend Changes

### 1. **api.js** - Added API Methods

#### New Export Functions

**downloadDocument(documentId, entryType)**
- Makes GET request to `/documents/download/{documentId}?entryType={entryType}`
- Response type: `blob` (binary data)
- Used by download button action

**viewDocument(documentId, entryType)**
- Makes GET request to `/documents/view/{documentId}?entryType={entryType}`
- Response type: `blob` (binary data)
- Used for inline viewing (PDFs, images)

### 2. **DocumentPreview.jsx** - Complete Rewrite

#### Features Implemented
✅ **Image Preview** - Displays images (JPG, PNG, GIF, WebP) with proper scaling
✅ **PDF Viewer** - Shows PDF placeholder with download and "View in New Tab" buttons
✅ **Generic File Handler** - Supports downloading any file type
✅ **Navigation** - Previous/Next buttons to browse multiple documents
✅ **Error Handling** - Shows error alerts if preview/download fails
✅ **Loading State** - Spinner while fetching file content
✅ **Document Info** - Shows document name, filename, and upload date

#### Key Changes
- Added imports for `downloadDocument` and `viewDocument` APIs
- Added `useEffect` to load image previews when document changes
- `handleDownload()` - Downloads file via blob URL
- `handleOpenInNewTab()` - Opens PDF/file in new browser tab
- `loadImagePreview()` - Fetches and displays image preview
- Added `entryType` prop to know which document type to fetch

### 3. **MyClaimsPage.jsx** - Integration Updates

#### New State Variable
```javascript
const [selectedEntryType, setSelectedEntryType] = useState('daily');
```

#### Updated Functions

**handleOpenDocuments(documents, entryType)**
- Now accepts `entryType` parameter
- Tracks which entry type the documents belong to
- Passes this to DocumentPreview component

**renderExpenseSection(title, items, entryType)**
- Now accepts `entryType` parameter
- Passes entry type to `handleOpenDocuments` when clicking document
- Updated all 6 section calls with correct entry types:
  - 'Daily Allowance' → 'daily'
  - 'Hotel' → 'hotel'
  - 'Telephone Calls / Internet' → 'telephone'
  - 'Taxi' → 'taxi'
  - 'Miscellaneous' → 'miscellaneous'
  - 'Other Trip Expenses' → 'other'

#### DocumentPreview Component Call
```jsx
<DocumentPreview
  open={documentPreviewOpen}
  onClose={handleCloseDocumentPreview}
  documents={selectedDocuments}
  entryType={selectedEntryType}  // ← New prop
/>
```

---

## User Experience Flow

### How It Works

1. **View Claim Expenses**
   - User opens "My Claims" page
   - Clicks "View" or "View Expenses" on a claim
   - Dialog shows claim details with expense sections

2. **Browse Documents**
   - User expands any expense section (Hotel, Taxi, etc.)
   - Documents appear as clickable chips with icons
   - PDF icon (red) for PDFs, image icon (blue) for images

3. **Preview Document**
   - User clicks on a document chip
   - DocumentPreview dialog opens showing:
     - **Images**: Display with proper scaling
     - **PDFs**: Show placeholder with action buttons
     - **Other Files**: Show filename with download button

4. **Interact with Document**
   - **Images**: Displayed directly in preview
   - **PDFs**:
     - "View in New Tab" - Opens PDF in browser viewer
     - "Download PDF" - Downloads PDF to device
   - **Navigation**: Use Previous/Next buttons for multiple docs
   - **Download**: Always available via main Download button

---

## Technical Architecture

### Data Flow: Download Request

```
Frontend:
  User clicks "Download" in DocumentPreview
  ↓
  downloadDocument(documentId, entryType) called
  ↓
  GET /api/documents/download/123?entryType=hotel
  ↓
Backend:
  DocumentController receives request
  ↓
  Calls documentService.downloadDocument(123, "hotel")
  ↓
  DocumentService fetches HotelDocument from DB
  ↓
  Gets filePath from document
  ↓
  Calls fileStorageService.retrieveFile(filePath)
  ↓
  FileStorageService reads file from disk
  ↓
  Returns FileDownloadResponse with file content
  ↓
  Controller sets Content-Disposition: attachment
  ↓
  Returns ResponseEntity with file content as blob
  ↓
Frontend:
  Response received as blob
  ↓
  Creates object URL from blob
  ↓
  Triggers browser download via <a> element
```

### Data Flow: View Request

```
Frontend:
  Component mounts or document index changes
  ↓
  loadImagePreview() called for images
  ↓
  viewDocument(documentId, entryType) called
  ↓
  GET /api/documents/view/456?entryType=daily
  ↓
Backend:
  DocumentController receives request
  ↓
  Sets Content-Disposition: inline
  ↓
  Returns file with correct Content-Type
  ↓
Frontend:
  Response received as blob
  ↓
  Creates object URL from blob
  ↓
  Sets as image src for display
```

---

## Supported File Types

| Type | Extension | Preview | Download |
|------|-----------|---------|----------|
| PDF | .pdf | ✅ Placeholder + View in New Tab | ✅ |
| JPEG | .jpg, .jpeg | ✅ Inline display | ✅ |
| PNG | .png | ✅ Inline display | ✅ |
| GIF | .gif | ✅ Inline display | ✅ |
| WebP | .webp | ✅ Inline display | ✅ |
| Other | Any | ⚠️ File icon only | ✅ |

---

## Error Handling

- **File not found**: Returns 404 "Document not found"
- **Invalid entry type**: Returns 400 "Invalid entry type"
- **File retrieval error**: Returns 500 with error message
- **Frontend network error**: Shows error alert in preview dialog
- **Blob creation error**: Caught and logged

---

## Security Features

1. **Path Traversal Prevention** - FileStorageService validates paths
2. **Entry Type Validation** - Only accepts known entry types
3. **Authentication** - All endpoints protected by JWT (via interceptor)
4. **Authorization** - Users can only access their own documents (via claim ownership)

---

## Testing Checklist

- [x] Backend compiles without errors
- [x] Frontend compiles without errors
- [ ] Upload document to a hotel expense
- [ ] Click document in My Claims view
- [ ] Verify PDF preview shows correctly
- [ ] Click "Download PDF" - verify file downloads
- [ ] Click "View in New Tab" - verify PDF opens
- [ ] Upload image to Daily Allowance
- [ ] Verify image displays in preview
- [ ] Test Previous/Next navigation
- [ ] Test download for image file
- [ ] Test all expense types (daily, hotel, telephone, taxi, misc, other)
- [ ] Test error scenarios (deleted file, invalid type)

---

## Deployment Notes

1. No database migrations required
2. No additional dependencies added
3. File storage directory must be writable (already configured)
4. Ensure CORS headers are correctly set (already configured)
5. Test with various file sizes and types

---

## Future Enhancements

- Add PDF.js library for in-app PDF viewer
- Add image gallery/lightbox for multiple images
- Add document annotation features
- Add bulk download as ZIP
- Add file compression before download
- Add virus scanning for uploaded files
