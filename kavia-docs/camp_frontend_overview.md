# camp_frontend Codebase Overview

## Project Purpose

The camp_frontend is a React-based web application serving as the main user interface for the High Maintenance Entertainment (HME) camp at Burning Man, designed to organize, coordinate, and manage a wide variety of camp logistics. It facilitates member signup, accommodation management, dues and payments tracking, job/volunteer assignments, food and meal planning, and shared events calendaring. The frontend is tailored for ~85 members but architected to be adaptable for use by other camps or communal groups.

## Main Features

- **Authentication**: Email/password-based user authentication via Supabase, with invite-based signup, login, and password reset capabilities.
- **Member Directory (Roster)**: Browse, search, and update camp member information; manage crew assignments and display status/buddy info.
- **Accommodations Management**: Visual interactive map for managing and editing accommodations (tents, RVs) with live updates and filtering.
- **Job Board**: Display, create/edit, and assign volunteer jobs for camp operations; enables real-time signup, role-based actions, stateful job status, and completion tracking.
- **Meal Planner**: Collaborative planning of meals, assigning cooks/shoppers/cleaners, and participant signup; manages meal role assignments and supports coordination for shared food efforts.
- **Payments Panel**: Track annual dues, payment state, and outstanding balances; includes Venmo integration for payment links and QR codes, real-time payment confirmations and administrative actions.
- **Calendar**: Unified calendar interface combining general camp events and members’ arrivals/departures, switchable via tabs; supports event creation, filtering, and timeline visualizations.
- **Dashboard/Home**: Quick-access dashboard with links to major features, ongoing status summaries, and navigation.
- **Theme Management**: Toggle between light and dark mode themes, with application-wide effect and user preference persistence.
- **Protected Routes**: Core feature pages are accessible only to authenticated users through route guarding logic.

## Notable Implementation Details

### Architecture & Structure

- **Component Organization**: All major app features (jobs, meals, accommodations, member directory, payments, calendar) are implemented as modular React components within the `/src/components` and `/src/pages` directories.
- **Routing**: React Router is employed for internal navigation; route definitions reside in `src/App.js`, with sections like login/signup/forgot on public routes and dashboard features protected under PrivateRoute.
- **State Management**: Feature pages use React hooks (`useState`, `useEffect`) for local state and side effects. Authentication state and user roles are managed globally via a custom `AuthContext` provider (see `src/contexts/AuthContext/`).
- **Supabase Integration**: All backend operations (auth, CRUD, real-time subscriptions) use Supabase’s JavaScript client, configured in `src/supabaseClient.js`. Environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_KEY`) are sourced for endpoint configuration.
- **Real-Time Data Sync**: Core features (jobs, members, meals, payments, accommodations) establish Supabase channel subscriptions to reflect live changes instantly across all clients.
- **Invite System**: Signup processes require a valid, unused invite token, verified and marked as consumed during registration.
- **Responsive Design**: Visual layout is created for dashboard-style navigation (sidebar with collapsible support for smaller screens) and main content panels, ensuring a mobile-responsive UI.

### Feature Flow and Notable Files

- **Entry Point**: `src/index.js` boots the React app and loads `App.js`.
- **Main Application Shell**: `src/App.js` provides the theme toggling, `AuthProvider`, routing setup, and layout wrapper via `DashboardLayout`.
    - **Dashboard Layout**: `components/DashboardLayout.js` organizes the main app structure—header (sign out, theme toggle), sidebar navigation, routed content area.
    - **Sidebar Navigation**: `components/SidebarNav.js` lists main pages with collapsible handling.
    - **Theme Toggle**: `components/ThemeToggle.js` for switching light/dark theme.
- **Auth Module**: All auth forms exist in `components/AuthForms/` (subcomponents for login, signup, reset, state management in index.js). Route protection is handled by `components/PrivateRoute/`.
- **Context Providers**: Authentication state and actions (login, logout, user session/role) are encapsulated in `contexts/AuthContext`.
- **Page Components**: Each main feature (Roster, Jobs, Meals, Calendar, Accommodations, Payments) has a dedicated React page in `src/pages/` using specialized child components for feature logic and UI.
- **Feature Components**:
    - **ArrivalCalendar, EventCalendar**: Timeline/status tracking for events and arrivals, with filtering and live updates.
    - **AccommodationsMap**: Drag-and-drop/edit interface for accommodations, with real-time backend sync.
    - **JobBoard**: Listing, form modals, signup/complete functionality for jobs.
    - **MealPlanner**: Meal roles, calendar assignment, and interactive meal participation.
    - **PaymentPanel**: Dues calculation, Venmo integration, history, and administrative tools for marking/confirming payments.
    - **MemberDirectory**: Displays and manages user info, supports profile editing, and incorporates real-time member state updates.

### Security & Environment

- **Protected Routes**: Most app sections are only accessible to logged-in users via the PrivateRoute mechanism.
- **Environment Variables**: Requires Supabase API URL and Key through `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` (pulled from the hosting environment).
- **Error Handling**: UI feedback for authentication, form submission, and live data errors is included in all submission workflows.

## High-Level Architecture Diagram

```mermaid
graph TD
    A[Browser] --> B[React App (index.js / App.js)]
    B -->|AuthProvider| C[AuthContext]
    B --> D[Router (PrivateRoute/public routes)]
    D --> E[DashboardLayout]
    E --> F[SidebarNav]
    E --> G[MainPanel: Route Pages]
    G --> H1[Home] & H2[Roster(MemberDirectory)] & H3[Jobs(JobBoard)] & H4[Meals(MealPlanner)] & H5[Calendar(ArrivalCalendar, EventCalendar)] & H6[Accommodations(AccommodationsMap)] & H7[Payments(PaymentPanel)]
    classDef feature fill:#ffe,stroke:#FF6F00,stroke-width:2px;
    H2,H3,H4,H5,H6,H7 class feature;
    subgraph Supabase Cloud (backend)
    Z1[Auth REST API]
    Z2[Realtime Channels]
    Z3[Database]
    Z4[Storage]
    end
    C -->|auth/roles| Z1
    H2 -.->|profile| Z3
    H3 -.->|jobs CRUD, updates| Z3 & Z2
    H4 -.->|meal CRUD, roles| Z3 & Z2
    H5 -.->|events, arrivals| Z3 & Z2
    H6 -.->|accom. CRUD| Z3 & Z2
    H7 -.->|dues, payments| Z3 & Z2
    B -->|ThemeProvider| E
```
*Notes*: All data flows (except static branding/assets) are dynamic and mediated via Supabase (database, authentication, and real-time updates).

## Extensibility

The codebase is built with modularity and real-time collaboration in mind, supporting quick adaptation to new requirements, the ability to add future modules, and customization for other communities. The use of Supabase allows seamless backend changes without major frontend rework.

## Color Palette and Layout

- **Primary Color**: `#FF6F00` (Burning Man orange)
- **Secondary**: `#37474F` (charcoal gray)
- **Accent**: `#76FF03` (lime green)
- **Default Theme**: Light, with full dark mode support.
- **Layout**: Dashboard, sidebar navigation, main content panel, mobile responsiveness.

## Third-Party Dependencies

- **Supabase**: Primary backend for data, authentication, and real-time features.
- **React Router**: Routing and guarded route logic.
- **Material-UI**: Used in some calendar tabs and controls.
- **Venmo**: For payments and QR code linkout.

## Conclusion

The camp_frontend provides a robust, modern user experience for managing camp logistics through a modular React architecture, with a real-time, invite-secured, and mobile-friendly design focused on both usability and extensibility.

---
*This overview is accurate as of the latest codebase state. For architectural, design, or API interface changes, please update this document accordingly.*
