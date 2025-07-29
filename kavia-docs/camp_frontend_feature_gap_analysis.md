# Feature Gap Analysis: HME Camp Logistics Coordinator App (camp_frontend)

## Introduction

This document compares the current implementation of the camp_frontend React application (as of this analysis) with the features and requirements outlined in the Product Requirements Document (PRD) and Architecture Document. The goal is to identify which planned features have already been implemented, are partially in place, or are still missing and yet to be developed.

---

## Features Required (from PRD and Architecture)

The following major functional features are required for MVP per the PRD and architecture:

1. Signup & Invitation System
2. Member Profile Creation/Editing & Directory
3. Accommodations Management & Planning
4. Arrival/Departure Calendar Tracking
5. Crew/Job Assignment/Signup & Management
6. Dues Calculation, Payment Integration (Venmo), and Status Tracking
7. Meal/Food Planner (communal meal calendar, signups, dietary needs)
8. Shared Event Calendar (personal/shared events, filtering by type)
9. Mobile Responsive Dashboard-style UI & Navigation
10. Admin-only Features (management, assignment, reminders)
11. Supabase Integration (auth, DB, real-time updates, file/media storage)
12. Notifications/Reminders (job, payment, events) *(optional, for future MVP or enhancement)*
13. Non-functional: Accessibility, Security, Responsive Layout, Scalability

---

## Implemented Features (Inferred from Codebase)

Based on the current codebase and component/page file naming, the following features are likely implemented or in-progress:

- **Signup & Authentication**: `components/AuthForms/Signup.js`, `components/AuthForms/index.js`
- **Profile Editing & Directory**: `components/MemberDirectory/MemberDirectory.js`, `components/MemberDirectory/ProfileEditor.js`, `pages/Roster.js`
- **Accommodations Management**: `components/AccommodationsMap/AccommodationsMap.js`, `pages/Accommodations.js`
- **Arrival/Departure Calendar**: `components/ArrivalCalendar/ArrivalCalendar.js`, `pages/Calendar.js`
- **Job Assignment/Signup**: `components/JobBoard/JobBoard.js`, `pages/Jobs.js`
- **Meal Planning**: `components/MealPlanner/MealPlanner.js`, `pages/Meals.js`
- **Payments/Dues**: `components/PaymentPanel/PaymentPanel.js`
- **Event Calendar**: `components/EventCalendar/EventCalendar.js`, `pages/Calendar.js`
- **Dashboard & Navigation**: `components/DashboardLayout.js`, `components/SidebarNav.js`, `src/App.js`
- **Supabase Integration**: `src/supabaseClient.js`
- **Mobile Responsive Styles/Theming**: Shared usage of CSS files, presence of `ThemeToggle.js/.css`

---

## Features Missing or Not Clearly Implemented

### 1. **Automatic Crew Assignment Based on Arrival/Departure and History**
   - The job signup/assignment modules (`JobBoard`, `Jobs.js`) are present, but there is no clear evidence of *automatic* crew assignment logic in file naming or description. This nuanced backend/frontend logic may be missing or only partially in place.

### 2. **Admin Invitation Management & Role-Based Controls**
   - While `Signup.js` references invites, dedicated admin tools for managing invites (generating/invalidation, role assignment, etc.) are not explicitly identified.
   - Similarly, while role-based UI is discussed in the architecture, exact segregation of "admin-only" UI/modules is unclear in the file structure.

### 3. **Notifications, Reminders, or Real-Time Toasts**
   - No component (such as `NotificationBar` or similar) exists for user notifications about upcoming jobs, meal sign-ups, or unpaid dues.
   - Real-time updates via Supabase are included in several modules, but user notification/reminder UX may be lacking.

### 4. **Job-Specific Notifications or Messaging**
   - PRD mentions role/job-specific notifications or chat, but no components for direct messaging or notifications by job/role appear present.
   - "Messaging/Chat" is marked as future enhancement in PRD, so not required for MVP.

### 5. **Advanced Accommodation Map: Interactive/Drag-and-Drop**
   - Although `AccommodationsMap` exists, the PRD and architecture mention plans for map-based drag-and-drop planning as a future enhancement. The current file naming does not confirm such advanced functionality.

### 6. **Calendar Enhancements: Filtering and Personal vs Shared View**
   - `EventCalendar.js` exists, but it is not explicit if advanced filtering, personal/shared event separation, or event-type filters (setup, meals, art build, etc.) are implemented.
   - The file `Calendar.js` may serve as a container, but further enhancements could be required.

### 7. **Slack or SMS Integration**
   - Not MVP, but noted as a future enhancement in both PRD and architecture. No evidence of such integration is present.

### 8. **Robust Payment Reconciliation (Venmo Webhook/Transaction Logging)**
   - `PaymentPanel.js` and mention of Venmo integration are present, but webhook or payment status callback handling is not seen in any specialized file.

### 9. **Bulk Import/Export / Data Management Tools for Organizers**
   - No apparent tools for organizers to perform bulk data changes.

---

## Features Currently Implemented or Partially Implemented (Summary Table)

| Feature                                  | Implemented | Notes / File(s)                                                    |
|-------------------------------------------|-------------|--------------------------------------------------------------------|
| Signup & Auth                            | Yes         | `components/AuthForms/Signup.js`, `AuthForms/index.js`             |
| Member Directory/Profile                  | Yes         | `components/MemberDirectory/*`, `pages/Roster.js`                  |
| Accommodation Planning                    | Yes         | `components/AccommodationsMap/*`, `pages/Accommodations.js`        |
| Arrival/Departure Calendar                | Yes         | `components/ArrivalCalendar/*`, `pages/Calendar.js`                |
| Job Assignment/Signup                     | Yes         | `components/JobBoard/*`, `pages/Jobs.js`                           |
| Meal/Food Planner                         | Yes         | `components/MealPlanner/*`, `pages/Meals.js`                       |
| Payments, Dues (w/ Venmo)                 | Yes         | `components/PaymentPanel/PaymentPanel.js`                          |
| Event/Activity Calendar                   | Yes         | `components/EventCalendar/EventCalendar.js`, `pages/Calendar.js`   |
| Responsive UI/Navigation                  | Yes         | `components/DashboardLayout.js`, `SidebarNav.js`, app-wide CSS     |
| Supabase Integration                      | Yes         | `src/supabaseClient.js`                                            |
| Admin-Only Features                       | Partial     | Role-based access implied, but admin-specific invite management UI missing |
| Notifications/Reminders                   | No          | No NotificationBar or reminder system present                      |
| Automatic Crew Assignment                 | Partial     | May exist in backend/logic, component for it not identified        |

---

## Conclusion & Recommendations

Most core MVP features from the PRD and architecture are represented in the React frontend file structure, suggesting at least partial implementation. Missing or unclear areas primarily revolve around advanced admin tools (invitation and role management), notification systems, mapping interactivity, and detailed payment reconciliation.

**Recommended next steps:**
- Review implementation of crew assignment and admin panel features for completeness.
- Add notification/reminder/logging system to improve user and organizer experience.
- Clarify and, if needed, implement admin-specific invite/role management interfaces/file(s).
- Document which parts of advanced features (drag-and-drop for map, enhanced event filtering, SMS/Slack integration, bulk management) are intentionally omitted as future enhancements.

---

**Sources Used**  
- Product Requirements Document (kavia-docs/camp_frontend_prd.md)
- Architecture Document (kavia-docs/camp_frontend_architecture.md)
- Directory and module review of camp_frontend/src/
