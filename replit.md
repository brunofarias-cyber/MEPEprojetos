# BProjetos - Educational Project Management Platform

## Overview
BProjetos is a comprehensive educational project management platform for Brazilian schools. It supports project-based learning with gamification, BNCC (Brazilian National Common Curricular Base) competency tracking, and role-based interfaces for teachers, students, and coordinators. The platform aims to increase student engagement through modern design with glassmorphism effects and professional polish.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Build System**: React 18 with TypeScript, Vite for fast HMR.
- **UI Component System**: Radix UI primitives, shadcn/ui components (New York style), custom design system with glassmorphism effects and gradient themes.
- **Design System**: Typography (Outfit, Plus Jakarta Sans), HSL-based semantic color tokens, Tailwind CSS for styling, four project theme colors (green, blue, purple, red).
- **State Management**: TanStack Query for server state management and API caching; local React state for UI interactions.
- **Data Fetching Strategy**: Centralized API request functions, query keys follow REST patterns, 401 handling, credentials included for session.

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for RESTful API endpoints.
- **Development vs Production**: Vite middleware for development, static file serving from `dist/public` for production.
- **API Structure**: RESTful endpoints, Zod schema validation, consistent error handling, JSON response format.
- **Session Management**: PostgreSQL-backed sessions using `connect-pg-simple`.

### Database Architecture
- **ORM & Schema Definition**: Drizzle ORM for type-safe operations, PostgreSQL via Neon serverless driver.
- **Database Schema**:
    - **Teachers**: User profiles, subject specialization, avatar, rating.
    - **Projects**: Core entity with title, subject, status, progress, theme, deadlines.
    - **Rubric Criteria**: Assessment criteria attached to projects.
    - **Students**: User profiles, email, avatar, XP points, level.
    - **Achievements**: Gamification badges.
    - **Student Achievements**: Junction table.
    - **BNCC Competencies**: Brazilian curriculum standards reference data.
    - **Project Competencies**: Junction table.
    - **Submissions**: Student work.
    - **Classes**: Classroom organization.
    - **Feedbacks**: Teacher comments on projects.
    - **Events**: Calendar entries for in-person meetings.
- **Data Access Pattern**: Storage abstraction layer, UUID-based primary keys, foreign key relationships.

### Role-Based Interface System
- **Three User Roles**: Teacher, Student, Coordinator, each with specific dashboards and functionalities.
- **Navigation Architecture**: Single-page application, conditional rendering based on role, shared sidebar with role-specific menu items.
- **Component Organization**: Pages organized by role (`pages/teacher/*`, `pages/student/*`, `pages/coordinator/*`), shared components, UI primitives from shadcn/ui.

### Feature Specifications
- **Authentication System**: JWT Token Authentication (signed tokens, 7-day expiration), Bcrypt password hashing, role-based routing, frontend AuthContext with localStorage persistence.
- **Roster Management**: CRUD operations for teachers and students, search/filter, modal forms with validation.
- **Spreadsheet Import System**:
    - **Backend**: Secure endpoint with dual authentication (JWT/session), Multer file upload, XLSX/CSV parsing with automatic column detection.
    - **Column Normalization**: Case-insensitive, diacritic-insensitive header matching for robust imports.
    - **Frontend**: SpreadsheetImport component with drag-and-drop, file preview, detailed import results.
    - **Security**: Teacher/coordinator-only access, validates file types, creates students with default password.
- **Project Planning System**:
    - **Schema**: `project_planning` table with objectives, methodology, resources, timeline, expectedOutcomes.
    - **UI**: Tabbed project detail page (Visão Geral, Planejamento, Avaliação) at `/project/:id`.
    - **Forms**: react-hook-form with zodResolver, auto-save detection, proper validation.
    - **Navigation**: Seamless routing from ProjectCard to detail view and back to dashboard.
- **BNCC PDF Upload & AI Analysis**:
    - **Backend**: `bncc_documents` table, PDF parsing (`pdf-parse`), Multer for file upload (20MB limit, PDF-only), Coordinator-only access.
    - **AI Integration**: OpenAI via Replit AI Integrations for extracting structured competencies and analyzing project alignment.
    - **Project Planning Analysis**: `analyzeProjectPlanning` function analyzes complete project planning against BNCC competencies with coverage percentages and justifications.
    - **Endpoint**: POST `/api/projects/:id/planning/analyze` validates teacher auth, planning existence, and competencies before analysis.
- **AI-Powered Competency Linking**:
    - **UI**: "Analisar com IA" button in Planning tab, enabled only when planning is saved (has `id` field).
    - **Modal**: BnccAnalysisModal displays AI suggestions with competency name, category, coverage percentage, description, and justification.
    - **Selection**: Toggle buttons allow teachers to select/deselect suggested competencies; all selected by default.
    - **Backend**: POST `/api/projects/:id/competencies` atomically replaces project competencies using Drizzle transaction (`db.transaction`).
    - **Security**: Teacher authentication required, validates project ownership before allowing competency modifications.
    - **Data Enrichment**: Analysis endpoint enriches AI responses with full competency objects (name, category, description).
    - **Display**: "Competências BNCC Vinculadas" section shows linked competencies as cards with name and description.
- **Teacher Feedback & Calendar System**:
    - **Feedback**: Teachers can post team-level feedback for projects (create, edit, delete).
    - **Calendar**: Teachers can schedule in-person meetings with teams (create, edit, delete events).
    - **Backend**: `feedbacks` and `events` tables, Zod validation, teacher-role enforcement.

## External Dependencies

### Core Libraries
- `@neondatabase/serverless`: PostgreSQL database driver.
- `drizzle-orm` & `drizzle-kit`: ORM and schema migration tools.
- `express`: Web server framework.
- `react` & `react-dom`: UI library.
- `@tanstack/react-query`: Server state management.
- `zod`: Runtime schema validation.

### UI Component Dependencies
- `@radix-ui/*`: Primitive component packages.
- `shadcn/ui`: Component library.
- `tailwindcss`: Utility-first CSS framework.
- `react-hook-form`: Form state management.
- `date-fns`: Date manipulation.
- `lucide-react`: Icon library.

### Development Tools
- `vite`: Build tool and dev server.
- `typescript`: Type checking.
- `tsx`: TypeScript execution for development server.
- `esbuild`: Production server bundling.

### Third-Party Integrations
- Google Fonts API: For custom typography.
- Neon Database: Serverless PostgreSQL hosting.
- Replit AI Integrations: For BNCC document analysis (powered by OpenAI).
- `connect-pg-simple`: PostgreSQL-backed session store.