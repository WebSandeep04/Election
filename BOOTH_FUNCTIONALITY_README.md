# Booth Management - Enhanced Functionality

## Overview
The Booth Management component has been enhanced with the following new features:

### 1. Lok Sabha - Vidhan Sabha Relationship
- When a Lok Sabha is selected, the system automatically fetches related Vidhan Sabhas
- Uses the API endpoint: `GET /api/vidhan-sabhas/lok-sabha/{loksabhaId}`
- The Vidhan Sabha dropdown is disabled until a Lok Sabha is selected
- Dynamic loading states show "Loading Vidhan Sabhas..." while fetching data

### 2. Timestamp Management
- **Created At**: Automatically set when creating a new booth
- **Updated At**: Automatically updated when saving changes
- Both timestamps are displayed in the form (read-only) and table
- Timestamps are formatted as readable dates in the UI

### 3. Enhanced User Experience
- Clear visual feedback for loading states
- Disabled states for dependent dropdowns
- Automatic reset of Vidhan Sabha selection when Lok Sabha changes
- Console logging for debugging API calls

## API Integration

### Vidhan Sabha Filtering
```javascript
// When Lok Sabha is selected
const handleLokSabhaChange = async (e) => {
  const loksabhaId = e.target.value;
  
  if (loksabhaId) {
    const result = await dispatch(fetchVidhanSabhasByLokSabha(loksabhaId));
    setFilteredVidhanSabhas(result.payload);
  }
};
```

### API Response Format
```json
{
  "vidhan_sabhas": [
    {
      "id": 5,
      "loksabha_id": 3,
      "vidhansabha_name": "Test Vidhan Sabha 3",
      "vidhan_status": "1",
      "created_at": "2025-01-13T...",
      "updated_at": "2025-01-13T...",
      "lok_sabha": {
        "id": 3,
        "loksabha_name": "Test Lok Sabha for Vidhan Sabha API",
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
- **Block**: Standard dropdown
- **Panchayat**: Standard dropdown
- **Village**: Standard dropdown
- **Type**: Ward (1) or Village (2)
- **Booth Name**: Text input

### Auto-generated Fields
- **Created At**: Set automatically on creation
- **Updated At**: Updated automatically on save
- **Status**: Defaults to Active (1)

## Table Display
The booth list table now includes:
- All standard booth information
- **Created At**: Formatted date
- **Updated At**: Formatted date
- Action buttons for Edit/Delete

## Error Handling
- API errors are logged to console
- User-friendly error messages
- Graceful fallback when API calls fail
- Loading states prevent multiple submissions

## Dependencies
- Redux store with `vidhanSabhaSlice`
- API configuration in `src/config/api.js`
- CSS styling in `src/components/screens/css/AddBooth.css`

## Usage
1. Click "Add New Booth" to open the form
2. Select a Lok Sabha from the dropdown
3. Wait for Vidhan Sabhas to load automatically
4. Select the appropriate Vidhan Sabha
5. Fill in remaining required fields
6. Submit the form
7. Timestamps are automatically managed

## Debugging
Check browser console for:
- API call logs
- Response data
- Error messages
- State changes
