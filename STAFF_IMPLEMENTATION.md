# STAFF ACCESS LEVEL IMPLEMENTATION

## Overview
This document describes the complete Staff access level implementation for the Schedulify project. Staff members can now manage all bookings, approve/reject requests, and perform full CRUD operations on bookings.

---

## Role-Based Access Summary

### 🔵 **USER Role**
Users can:
- ✅ Create/book appointments
- ✅ View their own appointments
- ✅ See booking status (pending, approved, rejected, cancelled)
- ✅ **Edit their own pending bookings** (NEW FEATURE)
- ✅ Cancel their own bookings (before or after approval)

Users cannot:
- ❌ Approve/reject bookings
- ❌ Edit approved bookings
- ❌ Delete other users' bookings
- ❌ Manage staff, rooms, services, or users

**Navigation:** Dashboard, Book Appointment, My Bookings

---

### 🟣 **STAFF Role**
Staff members can:
- ✅ View all bookings from all users
- ✅ Approve bookings
- ✅ Reject bookings
- ✅ Edit any booking (change date, time, status, notes)
- ✅ Delete bookings
- ✅ Filter bookings by status (all, pending, approved, rejected, cancelled)
- ✅ Search bookings by user/date/service/staff/room
- ✅ See comprehensive booking statistics dashboard

Staff members cannot:
- ❌ Create bookings as a normal user
- ❌ Access "My Bookings" like customers
- ❌ Manage system users
- ❌ Manage rooms/staff/services
- ❌ Access full admin settings

**Navigation:** Staff Dashboard, Manage Bookings

---

### 🔴 **ADMIN Role**
Admins can:
- ✅ All staff permissions
- ✅ Manage services (add/edit/delete/toggle active status)
- ✅ Manage staff members (add/edit/delete/toggle availability)
- ✅ Manage rooms (add/edit/delete/toggle availability)
- ✅ Manage users (view all users, change roles, delete users)
- ✅ View system-wide statistics and charts
- ✅ Full access to all features

**Navigation:** Admin Dashboard (with links to Manage Services, Staff, Rooms, Users)

---

## New Backend Endpoints

### 1. **Update Booking**
```
PUT /api/bookings/:id
Access: Private (Owner can edit own pending, Admin/Staff can edit any)
```
**Request Body:**
```json
{
  "service": "serviceId",
  "assignedStaff": "staffId",
  "room": "roomId",
  "date": "2026-04-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "notes": "Updated notes",
  "status": "approved"  // Only admin/staff can change status
}
```

**Features:**
- Users can only edit their own **pending** bookings
- Staff/Admin can edit any booking
- Staff/Admin can change booking status
- Validates for conflicts before saving
- Returns populated booking with all relations

---

### 2. **Delete Booking**
```
DELETE /api/bookings/:id
Access: Private/Admin,Staff only
```

**Response:**
```json
{
  "message": "Booking deleted successfully",
  "bookingId": "bookingId"
}
```

---

## New Frontend Pages

### 1. **StaffDashboard.jsx** (`frontend/src/pages/Staff/StaffDashboard.jsx`)

**Features:**
- Statistics cards showing:
  - Total Bookings
  - Pending Bookings
  - Approved Bookings
  - Rejected Bookings
  - Cancelled Bookings
- Doughnut chart visualizing booking status distribution
- Quick action buttons:
  - "Manage All Bookings" → navigates to ManageBookings page
  - "Review Pending Bookings" → navigates with pending filter
- Role information card explaining staff permissions

**Route:** `/staff/dashboard`
**Access:** STAFF, ADMIN

---

### 2. **ManageBookings.jsx** (`frontend/src/pages/Staff/ManageBookings.jsx`)

**Features:**
- **View all bookings** in a paginated table (desktop) or card view (mobile)
- **Search functionality:** Search by user, service, staff, or room name
- **Filter by status:** All, Pending, Approved, Rejected, Cancelled
- **Quick Actions:**
  - ✓ **Approve** button (for pending bookings)
  - ✗ **Reject** button (for pending bookings)
  - ✎ **Edit** button (for all bookings) → opens edit modal
  - 🗑 **Delete** button (for all bookings) → shows confirmation modal

**Edit Modal:**
- Change date
- Change start/end time
- Update notes
- Change status (pending/approved/rejected/cancelled)
- Validates for conflicts

**Delete Modal:**
- Confirmation dialog before deletion
- Warning about irreversible action

**Route:** `/staff/manage-bookings`
**Access:** STAFF, ADMIN

---

## Updated Components

### 1. **Navbar Component** (`frontend/src/components/layout/Navbar.jsx`)

**Changes:**
- **Role-based navigation** - Shows different links based on user role:
  - **USER:** Dashboard, Book Appointment, My Bookings
  - **STAFF:** Staff Dashboard, Manage Bookings
  - **ADMIN:** Admin (Admin Dashboard link)

**Implementation:**
```javascript
// Desktop Navigation
{hasRole("USER") && !hasAnyRole(["STAFF", "ADMIN"]) && (
  <> Dashboard | Book Appointment | My Bookings </>
)}

{hasRole("STAFF") && !hasRole("ADMIN") && (
  <> Staff Dashboard | Manage Bookings </>
)}

{hasRole("ADMIN") && (
  <> Admin </>
)}
```

**Mobile Navigation:** Same logic applied to mobile menu

---

### 2. **BookingTable Component** (`frontend/src/components/BookingTable.jsx`)

**New Features:**
- **Edit Button** for pending bookings (visible to users)
- **Edit Modal** with form to update:
  - Date
  - Start Time
  - End Time
  - Notes
- **Validation:** Users can only edit pending bookings
- **Info message:** "You can only edit pending bookings. After approval, please contact staff for any changes."

**Desktop Table:**
```
Actions Column: [Edit] [Cancel]
```

**Mobile Cards:**
```
[Edit Booking] button (blue)
[Cancel Booking] button (red)
```

---

## Routes Configuration

### Updated `AppRoutes.jsx`

```javascript
// User Routes
<Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
<Route path="/book-appointment" element={<ProtectedRoute element={<BookAppointment />} />} />
<Route path="/my-bookings" element={<ProtectedRoute element={<MyBookings />} />} />

// Staff Routes (NEW)
<Route
  path="/staff/dashboard"
  element={<ProtectedRoute element={<StaffDashboard />} requiredRoles={["STAFF", "ADMIN"]} />}
/>
<Route
  path="/staff/manage-bookings"
  element={<ProtectedRoute element={<ManageBookings />} requiredRoles={["STAFF", "ADMIN"]} />}
/>

// Admin Routes
<Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminDashboard />} requiredRoles={["ADMIN"]} />} />
<Route path="/admin/services" element={<ProtectedRoute element={<ManageServices />} requiredRoles={["ADMIN"]} />} />
<Route path="/admin/staff" element={<ProtectedRoute element={<ManageStaff />} requiredRoles={["ADMIN"]} />} />
<Route path="/admin/rooms" element={<ProtectedRoute element={<ManageRooms />} requiredRoles={["ADMIN"]} />} />
<Route path="/admin/users" element={<ProtectedRoute element={<ManageUsers />} requiredRoles={["ADMIN"]} />} />
```

---

## Backend Files Modified

### 1. **bookingController.js** (`backend/controllers/bookingController.js`)

**Added Functions:**
- `updateBooking()` - PUT /api/bookings/:id
- `deleteBooking()` - DELETE /api/bookings/:id

**Exported:**
```javascript
module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,      // NEW
  deleteBooking,      // NEW
  cancelBooking,
  approveBooking,
  rejectBooking,
  getAvailableSlots,
};
```

---

### 2. **bookingRoutes.js** (`backend/routes/bookingRoutes.js`)

**Added Routes:**
```javascript
// @route   PUT /api/bookings/:id
router.put("/:id", protect, updateBooking);

// @route   DELETE /api/bookings/:id
router.delete("/:id", protect, allowRoles("admin", "staff"), deleteBooking);
```

---

## Frontend Files Created

1. **`frontend/src/pages/Staff/StaffDashboard.jsx`** (390 lines)
   - Statistics dashboard with booking charts
   - Quick action buttons
   - Role information display

2. **`frontend/src/pages/Staff/ManageBookings.jsx`** (653 lines)
   - Complete booking management interface
   - Search and filter functionality
   - Edit/Delete modals
   - Approve/Reject actions

---

## Frontend Files Modified

1. **`frontend/src/components/layout/Navbar.jsx`**
   - Added role-based conditionals for navigation
   - Imported `hasAnyRole` helper
   - Updated both desktop and mobile menus

2. **`frontend/src/components/BookingTable.jsx`**
   - Added Edit button for pending bookings
   - Added Edit modal with form
   - Added success message state
   - Updated Actions column layout

3. **`frontend/src/routes/AppRoutes.jsx`**
   - Imported Staff pages
   - Added `/staff/dashboard` route
   - Added `/staff/manage-bookings` route

---

## Testing the Implementation

### 1. **Test User Access (Role: user)**

**Login as user:**
```
Email: any registered user without staff/admin role
```

**Expected Navigation:**
- Dashboard
- Book Appointment
- My Bookings

**Test Edit Feature:**
1. Go to "My Bookings"
2. Find a **pending** booking
3. Click "Edit" button
4. Change date/time/notes
5. Click "Save Changes"
6. Verify booking is updated
7. Try editing an **approved** booking → should see no Edit button

---

### 2. **Test Staff Access (Role: staff)**

**Create a staff user:**
1. Register a new account OR use existing account
2. Login as admin
3. Go to `/admin/users`
4. Change the user's role to "Staff"
5. Logout and login as that staff user

**Expected Navigation:**
- Staff Dashboard
- Manage Bookings
- **NO** Dashboard, Book Appointment, My Bookings

**Test Staff Dashboard:**
1. Navigate to `/staff/dashboard`
2. Verify statistics cards show correct counts
3. Verify chart displays booking distribution
4. Click "Manage All Bookings" → should navigate to ManageBookings

**Test Manage Bookings:**
1. Navigate to `/staff/manage-bookings`
2. **Test Search:** Type user name → should filter bookings
3. **Test Filter:** Select "Pending" → should show only pending bookings
4. **Test Approve:** Click ✓ on pending booking → status changes to approved
5. **Test Reject:** Click ✗ on pending booking → status changes to rejected
6. **Test Edit:**
   - Click ✎ on any booking
   - Edit modal opens
   - Change date/time/notes/status
   - Save changes → booking updates
7. **Test Delete:**
   - Click 🗑 on any booking
   - Confirmation modal appears
   - Confirm deletion → booking removed

---

### 3. **Test Admin Access (Role: admin)**

**Login as admin:**
```
Email: admin account
```

**Expected Navigation:**
- Admin (link to Admin Dashboard)
- Admin should also be able to access staff routes

**Test Admin Can Access Staff Pages:**
1. Manually navigate to `/staff/dashboard`
2. Should see Staff Dashboard (admins have staff permissions)
3. Navigate to `/staff/manage-bookings`
4. Should see Manage Bookings page
5. Test all staff features work for admin

**Test Admin Unique Features:**
1. Navigate to `/admin/dashboard`
2. Verify access to:
   - Manage Services
   - Manage Staff
   - Manage Rooms
   - Manage Users

---

## Security Verification

### 1. **Backend Authorization**
```javascript
// Only staff and admin can delete bookings
router.delete("/:id", protect, allowRoles("admin", "staff"), deleteBooking);

// Anyone can update, but controller checks:
// - Users can only edit own pending bookings
// - Staff/Admin can edit any booking
router.put("/:id", protect, updateBooking);
```

### 2. **Frontend Protection**
```javascript
// Staff routes require STAFF or ADMIN role
<Route
  path="/staff/dashboard"
  element={<ProtectedRoute element={<StaffDashboard />} requiredRoles={["STAFF", "ADMIN"]} />}
/>
```

### 3. **UI Restrictions**
- Users only see Edit button for their **pending** bookings
- Staff see Edit button for **all** bookings
- Edit modal shows appropriate fields based on role
- Status field only editable by staff/admin

---

## API Endpoints Summary

### Public/All Authenticated Users
- `GET /api/bookings/my` - Get user's own bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking (with restrictions)
- `PATCH /api/bookings/:id/cancel` - Cancel booking (owner or staff/admin)

### Staff & Admin Only
- `GET /api/bookings` - Get all bookings
- `PATCH /api/bookings/:id/approve` - Approve booking
- `PATCH /api/bookings/:id/reject` - Reject booking
- `DELETE /api/bookings/:id` - Delete booking

---

## User Flow Diagrams

### User Booking Flow
```
1. User registers → Role: "user"
2. User logs in → sees Dashboard, Book Appointment, My Bookings
3. User books appointment → Status: "pending"
4. User can edit pending booking (date/time/notes)
5. Staff approves → Status: "approved"
6. User can no longer edit (no Edit button shown)
7. User can still cancel if needed
```

### Staff Booking Management Flow
```
1. Admin promotes user to Staff role
2. Staff logs in → sees Staff Dashboard, Manage Bookings
3. Staff views all bookings from all users
4. Staff filters to "Pending" bookings
5. Staff reviews booking details
6. Staff either:
   - Approves → booking confirmed
   - Rejects → user notified (can book again)
   - Edits → changes date/time if needed
   - Deletes → removes booking entirely
```

---

## Common Issues & Solutions

### Issue 1: Staff sees User navigation
**Solution:** Check token helper functions are case-insensitive
```javascript
// tokenHelper.js should handle STAFF, Staff, staff
export const hasRole = (role) => {
  const userRole = getTokenRole();
  return userRole?.toUpperCase() === role?.toUpperCase();
};
```

### Issue 2: Can't edit pending booking
**Solution:** Check backend PUT route exists and user is booking owner
```javascript
// Backend: updateBooking function checks:
const isOwner = booking.user.toString() === req.user.id;
if (isOwner && booking.status !== "pending") {
  return res.status(403).json({ message: "Can only edit pending bookings" });
}
```

### Issue 3: 404 on staff routes
**Solution:** Verify staff routes are added to AppRoutes.jsx
```javascript
import StaffDashboard from "../pages/Staff/StaffDashboard";
import ManageBookings from "../pages/Staff/ManageBookings";
```

---

## Success Criteria

✅ **User Role**
- [x] Can create bookings
- [x] Can view own bookings
- [x] Can edit own pending bookings
- [x] Can cancel own bookings
- [x] Cannot approve/reject bookings
- [x] Cannot access staff pages
- [x] Cannot access admin pages

✅ **Staff Role**
- [x] Can view all bookings
- [x] Can approve bookings
- [x] Can reject bookings
- [x] Can edit any booking
- [x] Can delete bookings
- [x] Can search and filter bookings
- [x] Cannot book appointments as user
- [x] Cannot access admin-only pages (manage users/services/staff/rooms)

✅ **Admin Role**
- [x] Has all staff permissions
- [x] Can manage users (promote to staff/admin)
- [x] Can manage services
- [x] Can manage staff
- [x] Can manage rooms
- [x] Can access all areas of the system

---

## Next Steps (Optional Enhancements)

### 1. **Email Notifications**
- Send email when booking is approved
- Send email when booking is rejected
- Send reminder emails before appointment

### 2. **Booking History**
- Track who approved/rejected bookings
- Show audit log of booking changes
- Display edit history

### 3. **Advanced Filtering**
- Date range filter
- Service type filter
- Staff member filter
- Room filter

### 4. **Bulk Operations**
- Approve multiple bookings at once
- Export bookings to CSV
- Print booking reports

### 5. **Calendar View**
- Month/week/day calendar views
- Drag-and-drop to reschedule
- Color-coded by status

---

## Conclusion

The Staff access level is now fully implemented with complete booking management capabilities. Staff members can efficiently manage all bookings, while users retain the ability to edit their pending bookings. The role-based navigation ensures users only see relevant features for their access level.

**Files Changed:** 7 files
**Files Created:** 3 files
**New Backend Endpoints:** 2 endpoints
**New Frontend Pages:** 2 pages
**Features Added:** 15+ features
