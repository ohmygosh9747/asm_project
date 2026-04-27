---
Task ID: 1
Agent: Main Agent
Task: Fix attendance marking failing in dashboard list view and calendar

Work Log:
- Read and analyzed the full codebase: prisma schema, page.tsx (4493 lines), all API routes
- Identified root causes of attendance marking failure:
  1. Employees API had `take: 7` limit which could exclude newly marked attendance records
  2. No cache-control headers on API responses, causing browser/Next.js to return stale data
  3. `onAttendanceChange()` was not awaited in EmployeeRow's markAttendance
  4. `fetchAttendance()` was not awaited in AttendanceCalendar's handleMarkAttendance
  5. No error details in attendance API error responses
- Fixed employees API: Changed `take: 7` to `take: 31` to ensure a full month of attendance records
- Added `Cache-Control: no-store, no-cache, must-revalidate` headers to employees and attendance GET responses
- Added `cache: "no-store"` and timestamp parameter to client-side fetch calls
- Fixed EmployeeRow.markAttendance to await onAttendanceChange()
- Fixed AttendanceCalendar.handleMarkAttendance to await fetchAttendance()
- Added input validation to attendance POST API (required fields, valid status values)
- Added detailed error messages in attendance API error responses
- Added console.error logging for debugging on both client and server
- Verified database operations work correctly via direct Prisma queries
- Verified build succeeds with no errors
- Restarted dev server on port 3000

Stage Summary:
- All attendance marking issues should now be resolved
- Key files modified: src/app/api/employees/route.ts, src/app/api/attendance/route.ts, src/app/page.tsx
- The main fixes were: increasing attendance take limit, adding cache control, awaiting async re-fetches
---
Task ID: 1
Agent: Main Agent
Task: Fix attendance marking bug, restrict calendar editing to today, fix dropdown positioning near footer

Work Log:
- Identified ROOT CAUSE of attendance marking bug: employees API used `take: 31` with `orderBy: { date: "desc" }` on DD-MM-YYYY strings. SQLite sorts these alphabetically, NOT chronologically, so `take: 31` could cut off recent dates when crossing month boundaries.
- Fixed employees API: Replaced `take: 31` with proper month-based filtering (current + previous month) using `endsWith` pattern matching
- Fixed calendar: Added future date restriction - only dates up to today are editable. Future dates show as opacity-50 with cursor-not-allowed
- Fixed dropdown positioning in dashboard: Added viewport space detection. When dropdown would overflow below viewport, it opens upward instead
- Fixed dropdown positioning in calendar: Added activeDayDirection state. Popup opens upward when near bottom of screen
- Updated calendar edit hint text to mention future date restriction
- Build successful, API tests pass

Stage Summary:
- Attendance marking bug FIXED: Root cause was `take: 31` with incorrect string-based date sorting
- Calendar future date restriction IMPLEMENTED: Only dates up to today are editable
- Dropdown upward positioning IMPLEMENTED: Both calendar and dashboard list detect screen space and open upward when needed
---
Task ID: 2
Agent: Main Agent
Task: Add Current Working Site dropdown and separate Year/Month filtering for notifications

Work Log:
- Added Site model to Prisma schema with id, name (unique), createdAt
- Added currentSite field to Employee model (String?, nullable)
- Ran prisma db push successfully
- Created /api/sites route with GET, POST, DELETE methods
- Updated Employee interface to include currentSite field
- Added Current Working Site display in Employee Detail Professional Details section with colored badges (amber for Idle, emerald for site names)
- Built custom searchable dropdown for Current Working Site in Employee Form:
  - Search input to filter sites
  - Site names listed alphabetically with Building2 icon
  - "Idle" option at bottom with amber color dot and ⏸ icon
  - "Add New Site" option at bottom with blue color dot and + icon
  - Inline input for adding new site name
  - Sites stored in database and fetched on form load
  - Auto-selects newly added site
- Updated Notifications view: replaced combined month/year dropdown with separate Year and Month selects
  - Year options: All Years + current year back 5 years
  - Month options: All Months + January through December
  - Applied to both Warnings and Fines tabs
- Updated warnings and fines API routes to support independent year and month filtering
- Build successful, all API tests pass

Stage Summary:
- Current Working Site feature fully implemented with searchable dropdown, idle/add options, and database persistence
- Notifications now have separate Year and Month filters for more flexible filtering
- All new API routes working (tested /api/sites CRUD)
