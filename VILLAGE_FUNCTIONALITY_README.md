# Village Management - Enhanced Functionality

## Overview
The Village Management component has been enhanced with hierarchical filtering functionality (Lok Sabha → Vidhan Sabha → Block → Panchayat) and timestamp management, similar to the other management components.

### 1. Hierarchical Relationship Management
- **Lok Sabha → Vidhan Sabha**: When a Lok Sabha is selected, the system automatically fetches related Vidhan Sabhas
- **Vidhan Sabha → Block**: When a Vidhan Sabha is selected, the system automatically fetches related Blocks
- **Block → Panchayat**: When a Block is selected, the system automatically fetches related Panchayats
- Uses the API endpoints: 
  - `GET /api/vidhan-sabhas/lok-sabha/{loksabhaId}`
  - `GET /api/blocks/vidhan-sabha/{vidhansabhaId}`
  - `GET /api/panchayats/block/{blockId}`
- Dropdowns are disabled until their parent selection is made
- Dynamic loading states show appropriate messages while fetching data

### 2. Timestamp Management
- **Created At**: Automatically set when creating a new village
- **Updated At**: Automatically updated when saving changes
- Both timestamps are displayed in the form (read-only) and table
- Timestamps are formatted as readable dates in the UI

### 3. Enhanced User Experience
- Clear visual feedback for loading states
- Disabled states for dependent dropdowns
- Automatic reset of child selections when parent selection changes
- Console logging for debugging API calls

## API Integration

### Hierarchical Filtering
```javascript
// When Lok Sabha is selected
const handleLokSabhaChange = async (e) => {
  const loksabhaId = e.target.value;
  
  if (loksabhaId) {
    const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
    setFilteredVidhanSabhas(result.payload);
  }
};

// When Vidhan Sabha is selected
const handleVidhanSabhaChange = async (e) => {
  const vidhansabhaId = e.target.value;
  
  if (vidhansabhaId) {
    const result = await dispatch(fetchBlocksByVidhanSabha(vidhansabhaId));
    setFilteredBlocks(result.payload);
  }
};

// When Block is selected
const handleBlockChange = async (e) => {
  const blockId = e.target.value;
  
  if (blockId) {
    const result = await dispatch(fetchPanchayatsByBlock(blockId));
    setFilteredPanchayats(result.payload);
  }
};
```

### API Response Format
```json
{
  "panchayats": [
    {
      "id": 5,
      "block_id": 3,
      "panchayat_name": "Test Panchayat 3",
      "panchayat_choosing": "1",
      "panchayat_status": "1",
      "created_at": "2025-01-13T...",
      "updated_at": "2025-01-13T...",
      "block": {
        "id": 3,
        "block_name": "Test Block for Panchayat API",
        "status": "1",
        "created_at": "2025-01-13T...",
        "updated_at": "2025-01-13T..."
      }
    }
  ],
  "pagination": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "from": 1,
    "to": 3,
    "has_more_pages": false
  }
}
```

## Form Fields

### Required Fields
- **Lok Sabha**: Must be selected first
- **Vidhan Sabha**: Only enabled after Lok Sabha selection
- **Block**: Only enabled after Vidhan Sabha selection
- **Panchayat**: Only enabled after Block selection
- **Village Name**: Text input

### Optional Fields
- **Village Type**: Ward (1) or Village (2)
- **Status**: Active (1) or Inactive (0)

### Auto-generated Fields
- **Created At**: Set automatically on creation
- **Updated At**: Updated automatically on save

## Table Display
The village list table includes:
- All standard village information
- **Created At**: Formatted date
- **Updated At**: Formatted date
- Action buttons for Edit/Delete

## Error Handling
- API errors are logged to console
- User-friendly error messages
- Graceful fallback when API calls fail
- Loading states prevent multiple submissions

## Dependencies
- Redux store with `vidhanSabhaSlice`, `blockSlice`, `panchayatSlice`
- API configuration in `src/config/api.js`
- CSS styling in `src/components/screens/css/AddVillage.css`

## Usage
1. Click "Add New Village" to open the form
2. Select a Lok Sabha from the dropdown
3. Wait for Vidhan Sabhas to load automatically
4. Select the appropriate Vidhan Sabha
5. Wait for Blocks to load automatically
6. Select the appropriate Block
7. Wait for Panchayats to load automatically
8. Select the appropriate Panchayat
9. Fill in the village name and other details
10. Submit the form
11. Timestamps are automatically managed

## Debugging
Check browser console for:
- API call logs
- Response data
- Error messages
- State changes

## Key Features
- **Hierarchical Filtering**: 
  - Vidhan Sabhas are filtered based on selected Lok Sabha
  - Blocks are filtered based on selected Vidhan Sabha
  - Panchayats are filtered based on selected Block
- **Timestamp Tracking**: Created and updated timestamps are automatically managed
- **User-Friendly Interface**: Clear loading states and helpful placeholder text
- **Error Handling**: Graceful fallback when API calls fail
- **Debugging Support**: Console logging for troubleshooting

## Implementation Details
- Uses `fetchVidhanSabhasByLokSabha` function for Vidhan Sabha filtering
- Uses `fetchBlocksByVidhanSabha` function for Block filtering
- Uses `fetchPanchayatsByBlock` function for Panchayat filtering
- Maintains `filteredVidhanSabhas`, `filteredBlocks`, and `filteredPanchayats` state for filtered results
- Automatically resets dependent selections when parent selection changes
- Handles editing mode by fetching related data for existing villages
- Includes proper loading states and disabled states for dependent dropdowns

## Village Types
- **Ward**: Urban administrative division (value: 1)
- **Village**: Rural administrative division (value: 2)

## Form Validation
- All required fields must be filled
- Vidhan Sabha is only enabled after Lok Sabha selection
- Block is only enabled after Vidhan Sabha selection
- Panchayat is only enabled after Block selection
- Form submission is disabled until all required fields are completed
- Proper error handling for API failures

## API Endpoints Used
- `GET /api/villages?page={page}` - Fetch villages (paginated)
- `GET /api/villages/{id}` - Get specific village
- `GET /api/villages/lok-sabha/{loksabhaId}` - Get villages by Lok Sabha ID
- `GET /api/villages/vidhan-sabha/{vidhansabhaId}` - Get villages by Vidhan Sabha ID
- `GET /api/villages/block/{blockId}` - Get villages by Block ID
- `GET /api/villages/panchayat/{panchayatId}` - Get villages by Panchayat ID
- `GET /api/vidhan-sabhas/lok-sabha/{loksabhaId}` - Get Vidhan Sabhas by Lok Sabha ID
- `GET /api/blocks/vidhan-sabha/{vidhansabhaId}` - Get Blocks by Vidhan Sabha ID
- `GET /api/panchayats/block/{blockId}` - Get Panchayats by Block ID
- `POST /api/villages` - Create new village
- `PUT /api/villages/{id}` - Update village
- `DELETE /api/villages/{id}` - Delete village
