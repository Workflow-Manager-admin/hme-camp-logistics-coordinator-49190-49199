# Product Requirements Document (PRD)
## HME Camp Logistics Coordinator App

---

### 1. Purpose & Overview

The HME Camp Logistics Coordinator App is a web-based solution designed to organize and manage all logistical aspects of the High Maintenance Entertainment (HME) camp at Burning Man, serving approximately 85 members but engineered for adaptability to similar camps. The app addresses key operational needs such as member sign-up and invitations, accommodation allocation, dues and payment tracking, job/volunteer logistics, meal planning, and a shared event calendar. Supabase is used as the backend service for authentication, database, and file storage, making the app secure and scalable.

---

### 2. Target Users

- **Camp Members**: Use all features to manage their logistics, profiles, duties, calendar, and meals.
- **Camp Organizers/Admins**: Oversee member activity, send invites, assign jobs, manage finances, and facilitate camp-wide coordination.
- **Volunteers/Visitors**: (Optional/Extended) Participate in limited features relevant to their temporary engagement.

---

### 3. Platform & Technology

- **Frontend:** React-based modern, responsive web app.
- **Backend:** Supabase (Authentication, PostgreSQL Database, File Storage).
- **Payment Services:** Venmo integration for dues payments.
- **Responsive Design:** Mobile and desktop accessible.

#### Environment Variables (Frontend/Supabase auth)
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_KEY`

---

### 4. Key Features & Functional Requirements

#### 4.1 Camp Signup & Invite System
- Members can sign up via unique invitation links.
- Admins can generate/manage invites.
- Integration with Supabase Auth for secure signup/login.
- Email confirmation and password reset flows.

#### 4.2 Member Profile & Directory
- Members create and edit personal profiles.
- Directory lists all members with crew, status, and assigned camp “buddy.”
- Profile fields: Name, Contact, Arrival/Departure dates, Allergies/Diet, Buddy, Role/Crew, Dues paid status, Accommodations.

#### 4.3 Accommodations Management
- Members can specify tent/RV type, size/footprint, and group/accommodation requests.
- Organizers view and edit accommodation assignments and camp layout data.

#### 4.4 Arrival/Departure Calendar
- Members input/update arrival and departure dates.
- Admin/crew view full camp arrival/departure roster.
- Used for determining setup/strike assignments.

#### 4.5 Crew/Job Assignment
- Automatic crew assignment based on arrival/departure and past history (e.g., setup/strike preference).
- Members view and sign up for camp tasks/jobs.
- Admins assign or override job assignments.
- Job-based notifications or messaging (role-specific).

#### 4.6 Dues Calculation & Payment
- App calculates annual dues per member (configurable by admin, e.g., early-bird, standard, low-income).
- Tracks payment status, with reminders for unpaid members.
- Integration with Venmo for payments (link/account info and transaction logging).

#### 4.7 Meal/Food Planner
- Shared meal planning/calendar for communal meals.
- Sign up for bringing/providing ingredients, cooking, or cleanup.
- Dietary preferences/allergies tracking.
- List food-related tasks and assignments.

#### 4.8 Event & Activity Calendar
- Shared calendar for events, activities, meals.
- Filter by event type (setup, meal, art build, workshop, etc.).
- Personal and shared event creation/view/edit.
- Integrates with arrival/departure and job assignment features.

#### 4.9 Mobile Responsive Design
- Modern, minimalistic design inspired by Burning Man.
- Adaptable for mobile and tablet use with touchscreen-friendly controls.

---

### 5. User Stories

#### Signup & Authentication
- *As a new member, I want to receive an invite and securely create an account so that only invited participants can join the camp.*
- *As a member, I want to reset my password if I forget it.*

#### Member Directory & Profiles
- *As a member, I want to view and update my own profile information, including my arrival date, accommodation needs, and dietary preferences.*
- *As an organizer, I want to see a directory of all members, their crew assignments, and whether their dues are paid, so I can manage logistics.*

#### Job Assignment
- *As a member, I want to see what camp jobs are available and sign up or state preferences.*
- *As an organizer, I want to automatically or manually assign camp jobs to members based on their skills and availability.*

#### Meal Planning
- *As a member, I want to sign up to participate in or help with shared camp meals, and see who is responsible for each meal/task.*

#### Event Calendar
- *As a member, I want to view and filter the camp event calendar so that I know what’s happening each day and when I am expected to help.*

#### Dues & Payments
- *As a member, I want to see how much I owe for dues and pay via Venmo easily, with the app tracking when my payment is received.*
- *As an organizer, I want to keep track of who has paid dues and send reminders to those who are outstanding.*

---

### 6. Layout & Style

- **Dashboard-style UI**: Sidebar navigation for primary features (Roster, Calendar, Accommodations, Meals, Jobs).
- **Main panels**: Contextual views for roster, job assignments, calendar events, and accommodations map/list.
- **Tabbed Content**: For events and meal planners.
- **Modals/Forms**: Used for member edits, new signups, job or meal signups.
- **Color Scheme**: Bold, accented, Burning Man–inspired palette. Primary: #FF6F00, Secondary: #37474F, Accent: #76FF03.
- **Theme**: Light, with modern, minimal aesthetic and large touch targets.

---

### 7. Supabase Integration Details

- **Authentication**: Email/password and possibly OAuth2 authentication for members via Supabase Auth.
- **Database**: PostgreSQL on Supabase, with tables for members, jobs, payment records, accommodations, events/meals.
- **Real-Time Features**: Live status on roster, calendar, and jobs enabled by Supabase’s real-time functionality.
- **Storage**: Profile and accommodation photos, event flyers, and any necessary shared documents, leveraging Supabase Storage.

---

### 8. Non-Functional Requirements

- **Scalability:** Should serve 85+ members; extensible to larger camps without major redesign.
- **Security:** All sensitive data (payments, personal information) secured via Supabase; minimal PII exposed.
- **Performance:** Fast load times, responsive design for camp environments with limited connectivity.
- **Accessibility:** Design considers color contrast, alternative text, and keyboard/touch navigation.
- **Reliability:** Data integrity maintained even when network is intermittent; offline-friendly to the greatest extent feasible in React/Supabase architecture.

---

### 9. Assumptions & Constraints

- The app will initially target the HME camp but be modular enough for other Burning Man or festival camps.
- Supabase will be used for all backend functionality: authentication, database, storage, and real-time features.
- Venmo will be embedded or linked out for payments.
- All core logic is implemented in the frontend; admin features are restricted via role-based access control.
- Environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_KEY`) must be provided for app deployment and build.

---

### 10. Future Enhancements (Not MVP, but considered)
- Integrate group messaging/chat.
- Map-based accommodation planning using interactive drag-and-drop.
- Slack or SMS integration for essential notifications.
- More advanced accounting and refund tracking.

---

### 11. Appendix

#### Example Data Models (to be implemented in Supabase)

- **Members**: `id`, `name`, `email`, `arrival_date`, `departure_date`, `accommodation_request`, `dietary_preferences`, `allergies`, `paid_status`, `role`, `crew_id`, `buddy_id`, etc.
- **Jobs**: `id`, `title`, `description`, `required_skills`, `assigned_member_id`, `status`, `timeslot`, etc.
- **Meals/Events**: `id`, `type`, `date`, `participants`, `responsibilities`, etc.
- **Payments**: `id`, `member_id`, `amount`, `method`, `date`, `confirmed`
- **Accommodations**: `id`, `type`, `size`, `location`, `assigned_member_id`, etc.

#### User Experience Flow (summary)
1. Organizer sends invites to new members.
2. Members accept invite, complete signup and profile.
3. Members update accommodation info and camp arrival/departure.
4. App (or admin) assigns jobs, tracks status, displays in calendar.
5. Members pay dues and see payment confirmation.
6. Meal and event coordination handled interactively.
7. Organizers access real-time overview/status of all camp logistics.

---

**End of PRD**
