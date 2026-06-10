# My Claims Page with Document Preview - Implementation Guide

## Overview

This implementation provides a complete backend-to-frontend solution for displaying travel reimbursement claims with associated documents. Each expense entry can now have multiple documents that are displayed in a preview gallery when clicked.

## Architecture

### Backend Structure

#### 1. **DocumentDTO** (New)
- Location: `dto/DocumentDTO.java`
- Contains document metadata: ID, name, file name, file path, and upload timestamp
- Shared across all document types

#### 2. **Updated Section DTOs**
All expense entry DTOs now include a `documents` list:
- `DailySummaryDTO`
- `HotelDTO`
- `TaxiDTO`
- `TelephoneDTO`
- `MiscellaneousDTO`
- `OtherExpenseDTO`

Each DTO now has:
```java
private List<DocumentDTO> documents;

public List<DocumentDTO> getDocuments() { ... }
public void setDocuments(List<DocumentDTO> documents) { ... }
```

#### 3. **Entity Layer Updates**
Changed fetch strategy for all entry entities to `FetchType.EAGER`:
- `DailySummaryEntry`
- `HotelEntry`
- `TaxiEntry`
- `TelephoneEntry`
- `MiscellaneousEntry`
- `OtherExpenseEntry`

**Why EAGER?** When fetching claims for display, we need documents to be loaded immediately, rather than lazy-loaded on demand.

#### 4. **ClaimService Enhancements**
Added document mapping in the service layer:

- **New Method**: `mapDocumentsToDTO(List<?> documents)`
  - Handles conversion of all document entity types to `DocumentDTO`
  - Polymorphic handling of HotelDocument, TaxiDocument, etc.
  - Filters out null values

- **Updated Mapping Methods**:
  - `mapDailySummaryToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`
  - `mapHotelToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`
  - `mapTelephoneToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`
  - `mapTaxiToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`
  - `mapMiscellaneousToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`
  - `mapOtherExpensesToDTO()` → includes `dto.setDocuments(mapDocumentsToDTO(...))`

### Frontend Components

#### 1. **DocumentPreview Component** (New)
- Location: `components/DocumentPreview.jsx`
- Features:
  - Dialog-based document viewer
  - Image preview (supported formats: jpg, jpeg, png, gif, webp)
  - PDF document handling with download link
  - Navigation between multiple documents
  - Document metadata display (name, file name, upload date)
  - Download functionality

**Usage**:
```jsx
<DocumentPreview
  open={documentPreviewOpen}
  onClose={handleCloseDocumentPreview}
  documents={selectedDocuments}
/>
```

**Props**:
- `open` (boolean): Controls dialog visibility
- `onClose` (function): Callback when dialog closes
- `documents` (array): Array of DocumentDTO objects to display

#### 2. **Updated MyClaimsPage**
- Location: `pages/MyClaimsPage.jsx`
- Changes:
  - Integrated DocumentPreview component
  - Added document preview handlers
  - Enhanced `renderExpenseSection()` to display document thumbnails
  - Documents now clickable to open in preview dialog

**New State**:
```jsx
const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
const [selectedDocuments, setSelectedDocuments] = useState([]);
```

**New Handlers**:
```jsx
const handleOpenDocuments = (documents) => { ... }
const handleCloseDocumentPreview = () => { ... }
```

**Enhanced Expense Table**:
- Added "Documents" column
- Shows document thumbnails with icons (PDF or image icon)
- Click to open preview gallery
- Displays "No documents" for entries without attachments

## Data Flow

### 1. Fetching Claims with Documents

```
User clicks "View Expenses" on claim
    ↓
MyClaimsPage calls getMyClaimsById(userId)
    ↓
API calls ClaimController.getMyClaimsClimate(@RequestParam Long userId)
    ↓
ClaimService.getClaimsByUser(userId)
    ↓
ClaimRepository.findByUserId(userId)
    ↓
For each Claim entity:
  - Entries are loaded with EAGER fetch strategy
  - All associated documents are loaded
  - ClaimDTO is created via convertToDTO()
  - Each section's entries include documents via mapXxxToDTO()
    ↓
DocumentDTOs are populated from corresponding entity documents
    ↓
Response with complete claim and all documents
```

### 2. Displaying Documents in My Claims

```
Expenses rendered in table with documents column
    ↓
User clicks document thumbnail or "No documents" row
    ↓
handleOpenDocuments(documents) called
    ↓
selectedDocuments state updated
    ↓
DocumentPreview dialog opens
    ↓
First document displayed
    ↓
User can:
  - View current document
  - Navigate to previous/next
  - Download document
  - See metadata (name, file name, upload date)
```

## Example API Response

When calling `GET /api/claims/my?userId=1`, the response now includes:

```json
[
  {
    "id": 1,
    "projectName": "Office Migration",
    "amount": 5000.00,
    "status": "APPROVED",
    "hotel": [
      {
        "id": 10,
        "description": "Hotel Stay - Night 1",
        "amount": 150.00,
        "days": 1,
        "total": 150.00,
        "documents": [
          {
            "id": 100,
            "documentName": "Hotel Receipt",
            "fileName": "receipt_2024-01-15.pdf",
            "filePath": "/uploads/documents/receipt_2024-01-15.pdf",
            "uploadedAt": "2024-01-15T10:30:00"
          },
          {
            "id": 101,
            "documentName": "Hotel Photo",
            "fileName": "hotel_photo.jpg",
            "filePath": "/uploads/documents/hotel_photo.jpg",
            "uploadedAt": "2024-01-15T10:32:00"
          }
        ]
      }
    ],
    "taxi": [
      {
        "id": 20,
        "description": "Airport Transfer",
        "amount": 45.00,
        "days": 1,
        "total": 45.00,
        "documents": [
          {
            "id": 200,
            "documentName": "Taxi Receipt",
            "fileName": "taxi_receipt.pdf",
            "filePath": "/uploads/documents/taxi_receipt.pdf",
            "uploadedAt": "2024-01-15T08:15:00"
          }
        ]
      }
    ]
  }
]
```

## How It Works - User Perspective

1. **User opens "My Claims" page**
   - Table shows list of all their claims
   - Each row has basic info: ID, Project, Route, Amount, Status, Created Date

2. **User clicks "View Expenses" button**
   - Dialog opens showing claim details
   - Can toggle "View Expenses" to see all expense sections

3. **View Expense Entries with Documents**
   - Each section (Hotel, Taxi, etc.) shows a table of entries
   - New column: "Documents"
   - For each entry with documents:
     - Shows document thumbnails/icons
     - Document name displayed
     - Icon indicates type: 📄 PDF or 🖼️ Image

4. **Click on Document to Preview**
   - DocumentPreview dialog opens
   - Shows the document (image rendered directly, PDF link)
   - Navigation controls to see other documents from same entry
   - Document metadata displayed
   - Download button to save document

5. **Navigate Documents**
   - Use "← Previous" and "Next →" buttons to browse
   - Shows position: "(X of Y)"
   - Buttons disabled if only one document

## Document File Path Handling

The frontend constructs URLs by prepending the base server URL:

```javascript
const imageUrl = `http://localhost:8080${document.filePath}`;
// Example: http://localhost:8080/uploads/documents/receipt_2024-01-15.pdf
```

**Configuration**:
- Update hardcoded `http://localhost:8080` if deploying to different server
- Recommendation: Use environment variables or config file for API base URL

## Performance Considerations

1. **EAGER vs LAZY Loading**
   - Documents are set to EAGER fetch on entry entities
   - This means all documents load when claim is fetched
   - Trade-off: More data per request, but no N+1 queries
   - For claims with many documents, consider pagination if needed

2. **Image Optimization**
   - Images loaded directly from server
   - Consider implementing thumbnails for faster preview
   - Could cache generated thumbnails

3. **PDF Handling**
   - PDFs are not embedded in preview
   - Users download to view
   - Consider embedding PDF viewer for better UX (pdf.js library)

## Testing Checklist

- [ ] Backend compiles without errors: `mvn clean compile`
- [ ] GET /api/claims/my?userId=1 returns documents in response
- [ ] Frontend shows My Claims page with expense tables
- [ ] Expense tables show document column
- [ ] Click on document opens DocumentPreview dialog
- [ ] Previous/Next navigation works
- [ ] Download button works
- [ ] Images display correctly
- [ ] PDF links work
- [ ] Navigation disabled when only one document
- [ ] Close dialog works correctly

## Future Enhancements

1. **Image Thumbnails**
   - Generate small thumbnails for preview in table
   - Improves performance and UX

2. **PDF Viewer Integration**
   - Use `react-pdf` or `pdfjs-dist` to embed PDF viewer
   - Better than link-based download

3. **Lazy Loading**
   - Consider lazy loading documents only when "View Expenses" clicked
   - Would require separate API endpoint or query optimization

4. **Document Comments**
   - Add ability to add notes/comments to documents
   - Approval workflow comments tied to documents

5. **Batch Download**
   - Download all documents for a claim as ZIP
   - Useful for archiving and sharing

6. **Drag-and-Drop Reordering**
   - Reorder documents within an entry
   - Change document sort order

## Troubleshooting

### Issue: Backend compilation error about DocumentDTO
**Solution**: Ensure DocumentDTO.java exists in `dto/` folder and is properly imported in ClaimService

### Issue: No documents showing in My Claims
**Solution**: 
1. Check database has documents linked to entries
2. Verify EAGER fetch is set on entry entities
3. Check API response includes documents array

### Issue: Document images not loading
**Solution**:
1. Verify file path in database is correct
2. Check files exist on server at specified path
3. Verify CORS configuration allows file serving
4. Check browser console for 404 errors

### Issue: DocumentPreview dialog doesn't open
**Solution**:
1. Verify DocumentPreview component is imported in MyClaimsPage
2. Check state management for documentPreviewOpen
3. Verify handleOpenDocuments function is called

## File Locations Summary

### Backend
- `src/main/java/.../dto/DocumentDTO.java` - New
- `src/main/java/.../dto/*DTO.java` - Updated (6 files)
- `src/main/java/.../entity/*Entry.java` - Updated (5 files)
- `src/main/java/.../service/ClaimService.java` - Updated

### Frontend
- `src/components/DocumentPreview.jsx` - New
- `src/pages/MyClaimsPage.jsx` - Updated
