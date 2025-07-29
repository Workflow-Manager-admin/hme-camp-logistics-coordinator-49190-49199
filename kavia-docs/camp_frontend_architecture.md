# Architecture Document
## HME Camp Logistics Coordinator App – Frontend & Supabase Integration

---

### 1. Introduction

This document provides the technical architecture for the HME Camp Logistics Coordinator App frontend. The application is built with React for a modern, responsive web experience, and tightly integrates with Supabase for backend services including authentication, PostgreSQL database, file storage, and real-time updates. The design prioritizes modularity, scalability, security, and ease of use for Burning Man camps (e.g., HME) but is adaptable for similar use cases.

---

### 2. Technology Stack

- **Frontend:** React (with JSX, React Hooks)
- **Styling:** Vanilla CSS leveraging CSS variables for theme management. Primary colors reflect Burning Man-inspired bold accents (#FF6F00, #37474F, #76FF03).
- **State Management:** Local React state; may adopt Context API or libraries if complexity increases.
- **Backend Integration:** Supabase JavaScript/TypeScript SDK (`@supabase/supabase-js`)
    - **Authentication:** Supabase Auth
    - **Database:** Supabase PostgreSQL (tables: members, jobs, payments, accommodations, events)
    - **Storage:** Supabase Storage for files/images
    - **Real-time:** Supabase real-time data streams (e.g., channels for member/join/leave, updates)
- **3rd Party Payment:** Venmo integration for dues
- **Environment Variables:**
    - `REACT_APP_SUPABASE_URL`
    - `REACT_APP_SUPABASE_KEY`

---

### 3. High-Level Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Frontend [React App]
        A[Sidebar Navigation]
        B[Feature Panels<br/>(Roster, Calendar, Jobs, Meals, Accommodations)]
        C[Modals/Forms]
        D[State Management]
        E[Supabase SDK Client]
    end
    subgraph Supabase [Supabase Backend]
        F[Auth<br/> (Registration, Login, Roles)]
        G[DB: PostgreSQL]
        H[Storage (media/files)]
        I[Real-time Services]
    end
    subgraph 3rdParty [External]
        J[Venmo API]
    end

    %% User actions
    User((User)) -->|Login/Signup| F
    User -->|UI Interaction<br/>(navigation, edit)| A & B & C

    %% Frontend connects to Supabase
    A -->|Calls API| E
    B -->|Reads/Writes | E
    C -->|Submits/updates| E
    E -->|Auth Requests| F
    E -->|CRUD ops| G
    E -->|Upload/Download| H
    E -->|Realtime Channels| I

    %% Payment Integration
    B -->|Pay Dues| J
    J -->|Webhook/Callback| G

    %% Auth controls access
    F -- Role & Session --> E

    %% Realtime updates to UI
    I -->|Live Events| D

    %% Media flows
    H <-->|Images/Files| E

    %% Data flow for UI panels
    G <-->|Member, job, event, accommodation| E

    %% Admin-Only
    Admin((Admin)) -.->|Role check| F

```

---

### 4. Frontend Component Structure

The React frontend is organized according to dashboard-style application principles:

#### **Layout**
- **Sidebar Navigation:** Entry point for primary sections, persistent across sessions.
- **Main Content Panel:** Dynamically displays feature modules—roster, calendar, jobs, meals, accommodations.
- **Tab Interfaces:** For toggling events, meals, filtered views.
- **Modals/Forms:** Used for editing profiles, submitting signups, job/meal assignments, payment interaction.
- **Theme Toggle:** Built-in light/dark mode, extensible for accessibility.

#### **Major UI Components**

| Component            | Description                                                                              | Supabase Integration                |
|----------------------|------------------------------------------------------------------------------------------|-------------------------------------|
| `SidebarNav`         | Navigation for major app features                                                        | n/a                                 |
| `DashboardPanel`     | Hosts panels for each major domain (jobs, calendar, roster, meals)                       | Fetches data from Supabase database |
| `MemberDirectory`    | Lists camp members, profile edit, dues status, crew assignments                          | Auth/session, members/db            |
| `ProfileEditor`      | Form/modal for updating member details, arrival, accommodations                          | Auth/session, update/member         |
| `AccommodationsMap`  | Display/edit campsite layout, tent/RV info                                               | Fetch & write accommodations table  |
| `JobBoard`           | Assignment, signup for crew jobs (setup, strike, etc), admin override                    | Jobs table, notifications           |
| `MealPlanner`        | Plan communal meals, assign tasks, dietary/allergy tracking                              | Meals/events tables, assignments    |
| `EventCalendar`      | Shared & filtered event calendar (activities, jobs, meals)                               | Events table, real-time updates     |
| `PaymentPanel`       | Displays dues, status, Venmo payment link/flow, logs transactions                        | Payments table, Venmo               |
| `AuthForms`          | Login/signup/reset/password, using Supabase Auth flows                                   | Supabase Auth, secure roles         |
| `NotificationBar`    | Outlines toasts, reminders for payments, jobs, events                                    | Real-time or time-based queries     |

---

### 5. Supabase Integration

- **Authentication:** All user, admin, and guest flows are handled via Supabase Auth. Session state is reflected in frontend. Role-based UI rendered as per `user.metadata.role`.
- **Database:** Tables are structured for normalized, relational data. All CRUD is handled client-side via `@supabase/supabase-js`.
    - Example tables: `members`, `jobs`, `payments`, `accommodations`, `events`, `meals`
- **Storage:** Photos and documents (“profile photo,” “accommodation image,” "flyers") are uploaded/downloaded via Supabase Storage client.
- **Real-time:** Frontend subscribes to changes in tables (e.g., member arrival, job assignments) and updates UI instantly without reload.
- **Security:** RBAC and RLS (Row Level Security) rules in Supabase ensure users can only access their allowed data. Appbases all sensitive flows (profile update, payments) on current user session.

#### **Environment Variables**

Frontend must be built and deployed with:
- `REACT_APP_SUPABASE_URL`: URL for Supabase project
- `REACT_APP_SUPABASE_KEY`: Project anon/public key for client access

Injected at build, never exposed in app code.

---

### 6. Key Data Models (Sample)

- **members:** `id`, `name`, `email`, `arrival_date`, `departure_date`, `accommodation_request`, `dietary_preferences`, `allergies`, `paid_status`, `role`, `crew_id`, `buddy_id`
- **jobs:** `id`, `title`, `description`, `required_skills`, `assigned_member_id`, `timeslot`, `status`
- **meals/events:** `id`, `type`, `date`, `participants`, `responsibilities`
- **payments:** `id`, `member_id`, `amount`, `method`, `date`, `confirmed`
- **accommodations:** `id`, `type`, `size`, `location`, `assigned_member_id`

---

### 7. Data Flow & User Interaction Example

1. **Signup and Login:**  
    - User opens app, enters invite code or signup via email (handled via Auth).
    - Session is established, role determined (member/admin).
2. **Profile Update:**  
    - User edits profile; data updates via Supabase client—on success, UI reflects change in real-time.
3. **Job Signup/Assignment:**  
    - Member subscribes to job list; signs up; table updated in DB.
    - Admin views real-time job roster, can override/assign as needed.
4. **Meal/Event Planning:**  
    - User views shared calendar, signs up for meal. Meal/event table updated and reflected to all subscribers.
5. **Dues/Payments:**  
    - User views payment status, clicks Venmo link, marks as paid (confirmed by admin or webhook).
6. **Realtime Updates:**  
    - All major lists use Supabase’s real-time subscriptions for low-latency collaboration/visibility.
7. **Access Control:**  
    - Each sensitive operation checks session, role, and may be further limited server-side by policy.

---

### 8. Modularity, Scalability & Security

- The codebase is organized so that feature modules are loosely coupled; new features (e.g. messaging, map-based layouts) can be introduced without affecting core flows.
- Scalability is inherent, since Supabase/PostgreSQL is scalable and frontend depends only on Supabase API.
- Sensitive information and critical state (e.g., payment, role-based access) are protected through Supabase Auth and RLS.

---

### 9. Future Considerations

- Potential for PWA (offline mode) using Supabase’s sync features.
- Integration for messaging (Slack/SMS), push notifications.
- Map-based visualization for accommodations (drag-and-drop).
- Bulk data import/export for organizer convenience.

---

### 10. Conclusion

This architecture document outlines a robust, modular, and scalable design for the HME Camp Logistics Coordinator, leveraging React for frontend speed/usability and Supabase for a secure, real-time backend. All major features, user stories, and security considerations are directly tied into the technology stack, streamlining both current operations and future enhancements.

---

**End of Architecture Document**
