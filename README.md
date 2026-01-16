# Psychologist Record Management System

A complete web application for psychologists to manage client records and sessions, built with Next.js (App Router) and Supabase.

## Features

- **Authentication**: Email/password signup and login for psychologists
- **Client Management**: Create and manage client folders
- **Session Management**: Add and view sessions for each client
- **Search & Filter**: Search clients by name, filter sessions by platform
- **Pagination**: Efficient pagination for clients and sessions lists
- **Clean UI**: Simple, intuitive interface with folder/file metaphor

## Tech Stack

- **Next.js 14** (App Router)
- **JavaScript** (no TypeScript)
- **Supabase** (PostgreSQL + Auth + JWT)
- **Tailwind CSS** (styling)

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL from `supabase-schema.sql` to create the database schema
4. Go to Settings > API to get your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── clients/        # Client management pages
│   │   │   ├── [clientId]/ # Individual client pages
│   │   │   └── new/        # New client form
│   │   └── page.js         # Dashboard home
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.js           # Root layout
│   └── page.js             # Root page (redirects)
├── components/             # Reusable components
│   ├── ClientList.js
│   ├── ClientSearch.js
│   ├── LogoutButton.js
│   ├── SessionFilter.js
│   └── SessionList.js
├── lib/
│   ├── auth.js             # Authentication helpers
│   └── supabase.js         # Supabase client
├── middleware.js           # Route protection
└── supabase-schema.sql     # Database schema
```

## Database Schema

### Clients Table
- `id` (UUID, primary key)
- `psychologist_id` (UUID, foreign key to auth.users)
- `name` (text, required)
- `email` (text, optional)
- `age` (integer, optional)
- `gender` (text, optional)
- `place` (text, optional)
- `created_at` (timestamp)

### Sessions Table
- `id` (UUID, primary key)
- `client_id` (UUID, foreign key to clients)
- `platform` (text, required)
- `session_date` (date, required)
- `session_time` (time, defaults to 00:00:00)
- `summary` (text, optional)
- `conditions` (text, optional)
- `created_at` (timestamp)

## Routes

- `/` - Redirects to dashboard or login
- `/login` - Psychologist login
- `/signup` - Psychologist registration
- `/dashboard` - Main dashboard with overview
- `/dashboard/clients` - List all clients
- `/dashboard/clients/new` - Create new client
- `/dashboard/clients/[clientId]` - View client and sessions
- `/dashboard/clients/[clientId]/sessions/new` - Create new session

## Features in Detail

### Authentication
- Secure email/password authentication via Supabase Auth
- JWT tokens handled automatically by Supabase
- Protected routes redirect to login if not authenticated
- Logout functionality clears session

### Client Management
- Create new clients with name, email, age, gender, and place
- View all clients in a paginated list
- Search clients by name
- Click any client to view their details and sessions

### Session Management
- Add sessions to clients with:
  - Platform (dropdown with koott, littlecare, or custom platforms)
  - Session date (time is optional)
  - Summary and conditions
- View all sessions for a client
- Filter sessions by platform
- Paginated session lists
- Custom platforms automatically appear in dropdown after first use

## Security

- Row Level Security (RLS) enabled on all tables
- Psychologists can only access their own clients and sessions
- All database operations go through Supabase with proper authentication
- Protected routes check authentication before rendering

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Notes

- All authentication is handled by Supabase
- No backend API routes needed - all operations use Supabase client
- Server components are used where possible for better performance
- Client components are used for interactive forms and search

## License

This project is built for psychologist record management purposes.
