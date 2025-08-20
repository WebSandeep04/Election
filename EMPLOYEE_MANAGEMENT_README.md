# Employee Management System

## Overview

The Employee Management system provides a comprehensive solution for managing employees with full CRUD operations, advanced search and filtering capabilities, and a modern, responsive user interface. The system integrates with a Laravel backend API and includes features for employee type management, document handling, and status tracking.

## Features

### 🎯 Core Functionality
- **Full CRUD Operations**: Create, Read, Update, Delete employees
- **Advanced Search**: Search by name, email, code, phone, or designation
- **Multi-Filter System**: Filter by status, employee type, and other criteria
- **Pagination**: Efficient data loading with configurable page sizes
- **Sorting**: Sort by any field in ascending or descending order
- **Real-time Updates**: Immediate UI updates after operations
- **Success/Error Notifications**: User-friendly feedback messages

### 🎨 User Interface
- **Modern Design**: Clean, professional interface with gradient headers
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, smooth transitions, and animations
- **Status Badges**: Color-coded status indicators
- **Action Buttons**: Intuitive edit, view, and delete operations
- **Modal Forms**: Clean form interfaces for data entry

### 📊 Data Management
- **Employee Types**: Integration with employee type management
- **Status Tracking**: Active, inactive, terminated, on leave statuses
- **Wage Management**: Formatted currency display
- **Date Handling**: Proper date formatting and validation
- **Address Management**: Multi-line address support

## API Integration

### Base Configuration
The system integrates with the Laravel API endpoints as documented in the API specification:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Bearer token (Laravel Sanctum)
- **Response Format**: JSON with standardized structure

### Endpoints Used

#### Employee Management
- `GET /api/employees` - Fetch all employees with pagination and filtering
- `GET /api/employees/{id}` - Fetch specific employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/{id}` - Update existing employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/active` - Fetch active employees
- `GET /api/employees/type/{employeeTypeId}` - Fetch employees by type

#### Employee Types
- `GET /api/employee-types` - Fetch employee types for dropdowns

## Component Structure

### Redux Store (`src/store/slices/employeeSlice.js`)
```javascript
// State Structure
{
  employees: [],           // Array of employees
  currentEmployee: null,   // Currently selected employee
  loading: false,         // Loading state
  error: null,            // Error messages
  success: null,          // Success messages
  pagination: {           // Pagination info
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  },
  filters: {              // Search and filter state
    search: '',
    status: '',
    employee_type_id: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  }
}
```

### Main Component (`src/components/screens/EmployeeManagement.jsx`)
- **Header Section**: Title, description, and add button
- **Search & Filters**: Advanced search and filtering controls
- **Employee List**: Responsive table with pagination
- **Modal Forms**: Add/Edit employee forms
- **Detail View**: Comprehensive employee information display

### Styling (`src/components/screens/css/EmployeeManagement.css`)
- **Modern Design**: Gradient backgrounds, shadows, and animations
- **Responsive Grid**: CSS Grid for form layouts
- **Status Badges**: Color-coded status indicators
- **Interactive Elements**: Hover effects and transitions

## Usage Instructions

### 1. Accessing Employee Management
1. Navigate to the sidebar menu
2. Click on "Master Data" to expand the section
3. Click on "Employee Management"

### 2. Viewing Employees
- The system automatically loads the first page of employees
- Use the search box to find specific employees
- Apply filters to narrow down results
- Navigate through pages using pagination controls

### 3. Adding a New Employee
1. Click the "Add New Employee" button
2. Fill in the required fields:
   - **Employee Type** (required)
   - **Full Name** (required)
   - **Email** (required)
   - **Password** (required for new employees)
3. Fill in optional fields as needed
4. Click "Create Employee"

### 4. Editing an Employee
1. Click the "Edit" button (pencil icon) next to any employee
2. Modify the desired fields
3. Leave password blank to keep the current password
4. Click "Update Employee"

### 5. Viewing Employee Details
1. Click the "View" button (eye icon) next to any employee
2. Review all employee information in a detailed modal
3. Click "Edit Employee" to modify from the detail view

### 6. Deleting an Employee
1. Click the "Delete" button (trash icon) next to any employee
2. Confirm the deletion in the dialog
3. The employee will be permanently removed

### 7. Searching and Filtering
- **Search**: Type in the search box to find employees by name, email, code, phone, or designation
- **Status Filter**: Select from Active, Inactive, Terminated, or On Leave
- **Employee Type Filter**: Filter by specific employee types
- **Sorting**: Choose field and order for sorting
- **Clear Filters**: Reset all filters to default state

## Form Fields

### Required Fields
- **Employee Type**: Dropdown selection from available types
- **Full Name**: Employee's complete name
- **Email**: Unique email address
- **Password**: Secure password (min 8 characters)

### Optional Fields
- **Phone Number**: Contact phone number
- **Employee Code**: Unique employee identifier
- **Designation**: Job title or position
- **Wages**: Monthly/annual salary amount
- **Joining Date**: Date of employment start
- **Status**: Current employment status
- **Termination Date**: Date of employment end (if applicable)
- **Address**: Full residential address
- **Active Status**: Checkbox to mark employee as active/inactive

## Status Management

### Employee Statuses
- **Active**: Currently employed and working
- **Inactive**: Temporarily inactive but not terminated
- **Terminated**: Employment has ended
- **On Leave**: Currently on leave of absence

### Status Badges
- **Active**: Green badge
- **Inactive**: Red badge
- **Terminated**: Yellow badge
- **On Leave**: Blue badge

## Error Handling

### Validation Errors
- Form validation with real-time feedback
- Required field indicators
- Email format validation
- Password strength requirements

### API Errors
- Network error handling
- Server error messages
- Authentication error handling
- Graceful fallbacks

### User Feedback
- Success messages with auto-clear (3 seconds)
- Error messages with auto-clear (5 seconds)
- Loading states during operations
- Confirmation dialogs for destructive actions

## Responsive Design

### Desktop (1200px+)
- Full table view with all columns
- Side-by-side form layouts
- Expanded filter panels

### Tablet (768px - 1199px)
- Responsive table with horizontal scroll
- Stacked form layouts
- Collapsible filter sections

### Mobile (< 768px)
- Card-based employee display
- Single-column forms
- Touch-friendly buttons
- Simplified navigation

## Performance Features

### Optimizations
- **Debounced Search**: Prevents excessive API calls
- **Pagination**: Loads data in chunks
- **Lazy Loading**: Loads employee types on demand
- **Caching**: Redux state management for data persistence

### Loading States
- **Skeleton Loading**: Placeholder content during data fetch
- **Spinner Indicators**: Visual feedback for operations
- **Disabled States**: Prevents multiple submissions

## Security Considerations

### Authentication
- Bearer token authentication
- Automatic token refresh
- Secure API communication

### Data Validation
- Client-side form validation
- Server-side validation
- Input sanitization
- XSS prevention

### Access Control
- Role-based access (if implemented)
- Protected endpoints
- Secure password handling

## Integration Points

### Employee Types
- Seamless integration with Employee Type management
- Dynamic dropdown population
- Real-time type updates

### Document Management
- Ready for document upload integration
- File type validation
- Storage management

### Analytics
- Integration with Employee Analysis tools
- Performance tracking
- Reporting capabilities

## Future Enhancements

### Planned Features
- **Bulk Operations**: Select multiple employees for batch actions
- **Export Functionality**: Export employee data to CSV/Excel
- **Advanced Filters**: Date range filters, salary range filters
- **Employee Photos**: Profile picture upload and display
- **Document Management**: Integrated document upload and viewing
- **Audit Trail**: Track changes and modifications
- **Email Notifications**: Automated notifications for status changes

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality
- **Advanced Search**: Elasticsearch integration
- **Performance Monitoring**: Analytics and performance tracking

## Troubleshooting

### Common Issues

#### Search Not Working
- Check if the search term is valid
- Ensure the API endpoint is accessible
- Verify network connectivity

#### Form Submission Errors
- Check required field validation
- Verify email format
- Ensure password meets requirements
- Check API response for specific error messages

#### Loading Issues
- Refresh the page
- Check browser console for errors
- Verify API endpoint availability
- Clear browser cache if needed

#### Pagination Problems
- Check pagination parameters
- Verify total count from API
- Ensure proper page number handling

### Debug Information
- Check browser console for JavaScript errors
- Verify Redux state in Redux DevTools
- Monitor network requests in browser dev tools
- Check API response format and status codes

## Support

For technical support or feature requests:
1. Check the browser console for error messages
2. Verify API endpoint availability
3. Review the API documentation
4. Contact the development team with specific error details

## Version History

### v1.0.0 (Current)
- Initial release with full CRUD functionality
- Advanced search and filtering
- Responsive design
- Redux state management
- Modern UI/UX

---

*This documentation is maintained by the development team and should be updated with each new feature or change.*
