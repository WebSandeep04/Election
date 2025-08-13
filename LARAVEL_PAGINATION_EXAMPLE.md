# Laravel API Pagination Implementation

This document shows how to implement pagination in your Laravel API controller to work with the frontend pagination.

## Updated CasteController.php

```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\CasteResource;
use App\Models\Caste;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CasteController extends Controller
{
    /**
     * Display a listing of the resource with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        // Get pagination parameters
        $perPage = $request->get('limit', 10); // Default 10 records per page
        $page = $request->get('page', 1); // Default page 1
        
        // Validate pagination parameters
        $request->validate([
            'page' => 'integer|min:1',
            'limit' => 'integer|min:1|max:100', // Max 100 records per page
        ]);

        // Fetch castes with pagination
        $castes = Caste::query()
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'castes' => CasteResource::collection($castes),
            'pagination' => [
                'current_page' => $castes->currentPage(),
                'last_page' => $castes->lastPage(),
                'per_page' => $castes->perPage(),
                'total' => $castes->total(),
                'from' => $castes->firstItem(),
                'to' => $castes->lastItem(),
                'has_more_pages' => $castes->hasMorePages(),
                'has_previous_page' => $castes->hasPreviousPage(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caste' => ['required', 'string', 'max:255'],
        ]);

        $caste = Caste::create($validated);

        return response()->json([
            'message' => 'Caste created successfully',
            'caste' => new CasteResource($caste),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Caste $caste): JsonResponse
    {
        return response()->json([
            'caste' => new CasteResource($caste),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Caste $caste): JsonResponse
    {
        $validated = $request->validate([
            'caste' => ['required', 'string', 'max:255'],
        ]);

        $caste->update($validated);

        return response()->json([
            'message' => 'Caste updated successfully',
            'caste' => new CasteResource($caste),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Caste $caste): JsonResponse
    {
        $caste->delete();

        return response()->json([
            'message' => 'Caste deleted successfully',
        ]);
    }
}
```

## API Response Format

The paginated API response will look like this:

```json
{
    "castes": [
        {
            "id": 1,
            "caste": "General",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        // ... more caste objects
    ],
    "pagination": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 10,
        "total": 50,
        "from": 1,
        "to": 10,
        "has_more_pages": true,
        "has_previous_page": false
    }
}
```

## API Endpoints

### Get Castes with Pagination
```
GET /api/castes?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10, max: 100)

**Response:**
- `castes`: Array of caste objects
- `pagination`: Pagination metadata

### Other Endpoints (unchanged)
```
GET    /api/castes/{id}     - Get specific caste
POST   /api/castes          - Create new caste
PUT    /api/castes/{id}     - Update caste
DELETE /api/castes/{id}     - Delete caste
```

## Frontend Integration

The frontend is already configured to:

1. **Send pagination parameters** in API requests
2. **Handle pagination response** from the API
3. **Display pagination controls** when there are multiple pages
4. **Show pagination info** (e.g., "Showing 1 to 10 of 50 entries")
5. **Navigate between pages** with Previous/Next buttons and page numbers

## Features

### ✅ **Frontend Pagination**
- Page navigation with Previous/Next buttons
- Page number buttons with ellipsis for large page counts
- Current page highlighting
- Disabled states for unavailable actions
- Responsive design for mobile devices

### ✅ **Backend Pagination**
- Configurable records per page (default: 10)
- Page number validation
- Maximum limit protection (100 records)
- Complete pagination metadata
- Laravel's built-in pagination features

### ✅ **User Experience**
- Loading states during page transitions
- Automatic refresh after create/update/delete operations
- Pagination info display
- Smooth animations and transitions
- Mobile-friendly responsive design

## Testing

You can test the pagination with these curl commands:

```bash
# Get first page (10 records)
curl -X GET "http://localhost:8000/api/castes?page=1&limit=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get second page (10 records)
curl -X GET "http://localhost:8000/api/castes?page=2&limit=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get 5 records per page
curl -X GET "http://localhost:8000/api/castes?page=1&limit=5" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

1. **Database Performance**: Pagination helps improve performance by limiting the number of records fetched from the database.

2. **User Experience**: Users can navigate through large datasets efficiently without overwhelming the interface.

3. **API Efficiency**: Reduces bandwidth usage and server load by fetching only necessary data.

4. **Scalability**: The system can handle large datasets without performance degradation.

5. **Consistency**: After create/update/delete operations, the current page is refreshed to show the latest data.
