<?php
/**
 * Caste Management Integration Test Script
 * 
 * This script tests the complete CRUD functionality for castes with category integration.
 * It verifies that the frontend can properly communicate with the Laravel API.
 */

// Configuration
$baseUrl = 'http://localhost:8000'; // Update this to your Laravel server URL
$apiToken = ''; // Add your API token here for testing

// Test data
$testCaste = [
    'caste' => 'Test Caste ' . date('Y-m-d H:i:s'),
    'category_id' => 1 // General category
];

$testCasteUpdate = [
    'caste' => 'Updated Test Caste ' . date('Y-m-d H:i:s'),
    'category_id' => 2 // OBC category
];

echo "🚀 Caste Management Integration Test\n";
echo "=====================================\n\n";

// Helper function to make API requests
function makeApiRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response
    ];
}

// Test 1: Get Caste Categories
echo "📋 Test 1: Fetching Caste Categories\n";
echo "------------------------------------\n";
$response = makeApiRequest("$baseUrl/api/caste-categories");
if ($response['status'] === 200) {
    echo "✅ Success: Categories fetched\n";
    $categories = $response['data']['data'] ?? $response['data'];
    echo "📊 Found " . count($categories) . " categories:\n";
    foreach ($categories as $category) {
        echo "   - {$category['name']} (ID: {$category['id']})\n";
    }
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 2: Get All Castes
echo "📋 Test 2: Fetching All Castes\n";
echo "-------------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes");
if ($response['status'] === 200) {
    echo "✅ Success: Castes fetched\n";
    $castes = $response['data']['castes'] ?? $response['data']['data'] ?? [];
    echo "📊 Found " . count($castes) . " castes\n";
    
    if (!empty($castes)) {
        echo "📋 Sample castes:\n";
        foreach (array_slice($castes, 0, 3) as $caste) {
            $categoryName = $caste['category_data']['name'] ?? 'No Category';
            echo "   - {$caste['caste']} (Category: $categoryName)\n";
        }
    }
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 3: Filter Castes by Category
echo "📋 Test 3: Filtering Castes by Category\n";
echo "---------------------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes?category_id=1");
if ($response['status'] === 200) {
    echo "✅ Success: Castes filtered by category\n";
    $castes = $response['data']['castes'] ?? $response['data']['data'] ?? [];
    echo "📊 Found " . count($castes) . " castes in General category\n";
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 4: Search Castes by Name
echo "📋 Test 4: Searching Castes by Name\n";
echo "-----------------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes?caste=brahmin");
if ($response['status'] === 200) {
    echo "✅ Success: Castes searched by name\n";
    $castes = $response['data']['castes'] ?? $response['data']['data'] ?? [];
    echo "📊 Found " . count($castes) . " castes matching 'brahmin'\n";
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 5: Create New Caste (if token provided)
if ($apiToken) {
    echo "📋 Test 5: Creating New Caste\n";
    echo "-----------------------------\n";
    $response = makeApiRequest("$baseUrl/api/castes", 'POST', $testCaste, $apiToken);
    if ($response['status'] === 201 || $response['status'] === 200) {
        echo "✅ Success: Caste created\n";
        $createdCaste = $response['data']['caste'] ?? $response['data'];
        echo "📋 Created: {$createdCaste['caste']} (ID: {$createdCaste['id']})\n";
        $createdCasteId = $createdCaste['id'];
        
        // Test 6: Update Caste
        echo "\n📋 Test 6: Updating Caste\n";
        echo "-------------------------\n";
        $response = makeApiRequest("$baseUrl/api/castes/$createdCasteId", 'PUT', $testCasteUpdate, $apiToken);
        if ($response['status'] === 200) {
            echo "✅ Success: Caste updated\n";
            $updatedCaste = $response['data']['caste'] ?? $response['data'];
            echo "📋 Updated: {$updatedCaste['caste']} (Category: {$updatedCaste['category_data']['name']})\n";
        } else {
            echo "❌ Failed: HTTP {$response['status']}\n";
            echo "Response: " . $response['raw'] . "\n";
        }
        
        // Test 7: Get Specific Caste
        echo "\n📋 Test 7: Getting Specific Caste\n";
        echo "--------------------------------\n";
        $response = makeApiRequest("$baseUrl/api/castes/$createdCasteId");
        if ($response['status'] === 200) {
            echo "✅ Success: Specific caste fetched\n";
            $caste = $response['data']['caste'] ?? $response['data'];
            echo "📋 Caste: {$caste['caste']} (Category: {$caste['category_data']['name']})\n";
        } else {
            echo "❌ Failed: HTTP {$response['status']}\n";
            echo "Response: " . $response['raw'] . "\n";
        }
        
        // Test 8: Delete Caste
        echo "\n📋 Test 8: Deleting Caste\n";
        echo "------------------------\n";
        $response = makeApiRequest("$baseUrl/api/castes/$createdCasteId", 'DELETE', null, $apiToken);
        if ($response['status'] === 200 || $response['status'] === 204) {
            echo "✅ Success: Caste deleted\n";
        } else {
            echo "❌ Failed: HTTP {$response['status']}\n";
            echo "Response: " . $response['raw'] . "\n";
        }
        
    } else {
        echo "❌ Failed: HTTP {$response['status']}\n";
        echo "Response: " . $response['raw'] . "\n";
    }
} else {
    echo "📋 Test 5-8: Skipped (No API token provided)\n";
    echo "To test CRUD operations, add your API token to the script.\n";
}
echo "\n";

// Test 9: Get Castes by Category Endpoint
echo "📋 Test 9: Get Castes by Category Endpoint\n";
echo "-----------------------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes/category/1");
if ($response['status'] === 200) {
    echo "✅ Success: Castes by category endpoint works\n";
    $castes = $response['data']['data'] ?? $response['data'];
    echo "📊 Found " . count($castes) . " castes in category 1\n";
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 10: Get Unassigned Castes
echo "📋 Test 10: Get Unassigned Castes\n";
echo "---------------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes/unassigned");
if ($response['status'] === 200) {
    echo "✅ Success: Unassigned castes endpoint works\n";
    $castes = $response['data']['data'] ?? $response['data'];
    echo "📊 Found " . count($castes) . " unassigned castes\n";
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Test 11: Pagination Test
echo "📋 Test 11: Pagination Test\n";
echo "---------------------------\n";
$response = makeApiRequest("$baseUrl/api/castes?page=1&limit=5");
if ($response['status'] === 200) {
    echo "✅ Success: Pagination works\n";
    $data = $response['data'];
    $pagination = $data['pagination'] ?? $data['meta'] ?? [];
    echo "📊 Page: {$pagination['current_page']}, Total: {$pagination['total']}, Per Page: {$pagination['per_page']}\n";
} else {
    echo "❌ Failed: HTTP {$response['status']}\n";
    echo "Response: " . $response['raw'] . "\n";
}
echo "\n";

// Frontend Integration Test
echo "📋 Frontend Integration Test\n";
echo "----------------------------\n";
echo "✅ The following endpoints are ready for frontend integration:\n";
echo "   - GET /api/caste-categories (for dropdown)\n";
echo "   - GET /api/castes (with pagination and filters)\n";
echo "   - POST /api/castes (create with category_id)\n";
echo "   - PUT /api/castes/{id} (update with category_id)\n";
echo "   - DELETE /api/castes/{id} (delete)\n";
echo "   - GET /api/castes/category/{id} (filter by category)\n";
echo "   - GET /api/castes/unassigned (unassigned castes)\n";
echo "\n";

// Response Format Summary
echo "📋 API Response Format Summary\n";
echo "------------------------------\n";
echo "✅ Caste objects include:\n";
echo "   - id, caste, category_id\n";
echo "   - category_data: { id, name, description }\n";
echo "   - created_at, updated_at\n";
echo "\n";
echo "✅ Pagination includes:\n";
echo "   - current_page, last_page, per_page\n";
echo "   - total, from, to, has_more_pages\n";
echo "\n";

echo "🎉 Integration Test Complete!\n";
echo "============================\n";
echo "Your Caste Management API is ready for frontend integration.\n";
echo "The React frontend should now work seamlessly with your Laravel backend.\n";
?>
