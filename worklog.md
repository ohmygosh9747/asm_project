---
Task ID: 1
Agent: Main Agent
Task: Fix attendance, notifications, and add new features to ASM app

Work Log:
- Updated Prisma schema: changed Attendance default status from "present" to "not_marked", added `read` boolean field to DeleteRequest model
- Ran `npx prisma db push` to sync schema changes
- Updated attendance API: when status is "overtime", auto-sets as "present" with overtimeHours saved separately
- Updated delete-requests API: added `read` field support in GET/PUT endpoints
- Updated warnings API: added month/year filtering via createdAt date range
- Updated fines API: added month/year filtering via createdAt date range
- Created new `/api/notification-count` endpoint returning total unread count across requests+warnings+fines
- Fixed EmployeeRow: removed "absent" default for today (now shows "Not Marked"), present+overtimeHours shows as OT
- Fixed DashboardView: stats cards now separate "Absent" from "Not Marked", present with overtime shows as "Overtime"
- Fixed AttendanceCalendar: handles not_marked status, overtime auto-sets present with OT hours, proper status indicators
- Updated Header: uses `/api/notification-count` API for bell badge count (requests+warnings+fines combined)
- Updated NotificationsView: added month filter dropdowns for warnings and fines tabs
- Added Mark as Read button for delete requests in notifications
- Added NEW badge for unread delete requests
- Updated NotificationPopups: added 5-minute reminder interval for unread notifications, View/Dismiss marks as read
- Build succeeded

Stage Summary:
- Attendance now defaults to "Not Marked" instead of "Absent"
- Overtime auto-sets as "Present" with overtime hours saved separately
- Notification count on bell icon shows total from all 3 types (requests+warnings+fines)
- Count decreases when items are marked as read
- Warnings and fines can be filtered by month
- 5-minute reminder popup for unread notifications (super admin only)
- Delete requests have read tracking
