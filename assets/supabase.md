# Supabase Configuration for HME Camp Logistics

## Database Schema

### Events Table

```sql
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  type text not null check (type in ('event', 'job', 'meal')),
  description text,
  is_recurring boolean default false,
  recurring_pattern text,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add updated_at trigger
create trigger handle_updated_at before update on public.events
  for each row execute procedure moddatetime (updated_at);

-- Enable Row Level Security
alter table public.events enable row level security;
```

### Row Level Security Policies

```sql
-- Allow all authenticated users to view events
create policy "Allow authenticated users to view events"
  on public.events for select
  to authenticated
  using (true);

-- Allow admin and member roles to create events
create policy "Allow admin and member roles to create events"
  on public.events for insert
  to authenticated
  using (
    auth.jwt() ->> 'role' in ('admin', 'member')
  );

-- Allow admin and member roles to update their own events
create policy "Allow admin and member roles to update their own events"
  on public.events for update
  to authenticated
  using (
    auth.jwt() ->> 'role' in ('admin', 'member') and
    (auth.jwt() ->> 'role' = 'admin' or created_by = auth.uid())
  );

-- Allow admin and member roles to delete their own events
create policy "Allow admin and member roles to delete their own events"
  on public.events for delete
  to authenticated
  using (
    auth.jwt() ->> 'role' in ('admin', 'member') and
    (auth.jwt() ->> 'role' = 'admin' or created_by = auth.uid())
  );
```

## Real-time Subscriptions

The events table is configured for real-time updates. The frontend listens for the following changes:
- INSERT: New events
- UPDATE: Modified events
- DELETE: Removed events

## Environment Variables

Required environment variables for Supabase integration:
- REACT_APP_SUPABASE_URL: Project URL
- REACT_APP_SUPABASE_KEY: Public API key

## Authentication and Authorization

The events feature uses the following user roles:
- admin: Full access to all events (create, read, update, delete)
- member: Can create events and manage their own events
- viewer: Can only view events

## Frontend Integration

The EventCalendar component uses the following Supabase functionality:
1. Real-time subscriptions for live updates
2. Row-level security for access control
3. User role-based permissions
4. CRUD operations on events table

## Data Model

Events table columns:
- id: Unique identifier
- title: Event name/title
- start_time: Event start datetime
- end_time: Event end datetime
- type: Event type (event, job, or meal)
- description: Optional event description
- is_recurring: Boolean flag for recurring events
- recurring_pattern: Pattern for recurring events (if applicable)
- created_by: User ID of event creator
- created_at: Timestamp of creation
- updated_at: Timestamp of last update
