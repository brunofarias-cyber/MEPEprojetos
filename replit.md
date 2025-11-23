# BProjetos - Educational Project Management Platform

## Overview

BProjetos is a comprehensive educational project management platform designed for Brazilian schools. The system facilitates project-based learning with gamification elements, BNCC (Brazilian National Common Curricular Base) competency tracking, and role-based interfaces for teachers, students, and coordinators. The platform emphasizes modern design with glassmorphism effects, professional polish, and educational gamification to increase student engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Status

### Task 2: Authentication System (✅ COMPLETED)
- ✅ PostgreSQL schema with users, teachers, students, coordinators tables
- ✅ Foreign keys with cascade delete implemented
- ✅ Bcrypt password hashing (10 rounds)
- ✅ **JWT Token Authentication** (signed tokens, 7-day expiration)
- ✅ Express-session with MemoryStore for development (backward compatible)
- ✅ Auth API routes: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
- ✅ Frontend AuthContext with localStorage persistence
- ✅ ProtectedRoutes with role-based routing
- ✅ Login/Register pages implemented
- ✅ Token-based auth middleware (validates JWT signature)
- ✅ E2E tests passing (login, navigation, token persistence, logout)

**Demo Credentials**:
- Coordenador: coordenador@escola.com / demo123
- Professor: ana@escola.com / demo123
- Aluno: lucas.alves@aluno.com / demo123

## Recent Updates (Nov 23, 2025)

### JWT Authentication Implementation
After extensive debugging of session cookie persistence issues in the Replit environment, implemented a secure JWT token-based authentication system:

**Technical Details**:
- Backend generates cryptographically signed JWT tokens on login (using `jsonwebtoken`)
- Token payload: `{ userId, email, role }`, expires in 7 days
- Frontend stores token in localStorage and injects `Authorization: Bearer {token}` header in all API requests
- Backend middleware validates token signature before populating `req.session.userId`
- Session-based auth still supported for backward compatibility

**Security**:
- Tokens are signed with SESSION_SECRET (cannot be forged)
- Token validation prevents user impersonation
- Much more secure than client-controlled headers

**User Experience**:
- Login persists across page refreshes
- Automatic token injection in all requests
- Seamless logout with token cleanup

### Task 3: Roster Management (✅ COMPLETED)
- ✅ Teacher management page with CRUD operations (/teachers)
- ✅ Student management page with CRUD operations (/students)
- ✅ Search/filter functionality for both pages
- ✅ Modal forms with validation (react-hook-form + zod)
- ✅ Sidebar navigation links added for Coordinator role
- ✅ E2E testing passed (full user flow verified)

### Task 4: BNCC PDF Upload & AI Analysis (✅ COMPLETED)
Implemented comprehensive BNCC document management with AI-powered competency extraction:

**Backend Infrastructure**:
- Database schema: `bncc_documents` table with processing status tracking
- Storage layer: Full CRUD operations for BNCC documents
- PDF parsing: pdf-parse v2 library for text extraction
- File upload: Multer middleware with 20MB limit, PDF-only validation
- Security: Coordinator-only access enforcement with JWT authentication

**AI Integration** (OpenAI via Replit AI Integrations):
- `extractCompetenciesFromText`: Analyzes BNCC PDF content and extracts structured competencies (name, category, description) as JSON
- `analyzeProjectAlignment`: Evaluates which BNCC competencies align with a given project and suggests coverage percentages
- Async processing: Upload returns immediately, AI extraction runs in background
- Status tracking: processing → completed/failed transitions with competency count

**API Endpoints**:
- `GET /api/bncc-documents` - List all uploaded BNCC documents
- `POST /api/bncc-documents/upload` - Upload PDF (coordinator-only, multipart/form-data)
- `POST /api/projects/:id/analyze-alignment` - Analyze project alignment with BNCC

**Frontend (Coordinator Only)**:
- BNCC page at `/bncc` with sidebar navigation
- File upload interface with drag-drop support
- Real-time status display (processing, completed, failed)
- Document list showing filename, extraction count, status icons
- Toast notifications for upload success/failure
- E2E tested: UI accessible, all elements present and functional

**Technical Notes**:
- Uses Replit AI Integrations (no API key needed, charges to Replit credits)
- Handles markdown code blocks in AI responses (````json`)
- Comprehensive error handling for PDF parsing, AI extraction, and database operations
- Portuguese error messages for user-facing endpoints

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR (Hot Module Replacement)
- Custom Vite configuration with Replit-specific plugins for development experience
- Client-side routing managed through component state (role-based navigation)

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant) for consistent design patterns
- Custom design system with glassmorphism effects and gradient themes
- Tailwind CSS for utility-first styling with custom configuration
- CSS variables for theme customization supporting light/dark modes

**Design System**
- Typography: Outfit font family for headers, Plus Jakarta Sans for body text
- Color system: HSL-based with semantic color tokens (primary, secondary, muted, accent, destructive)
- Spacing: Consistent scale using Tailwind units (2, 4, 8, 12, 16)
- Visual effects: Glassmorphism cards, gradient themes, animation utilities
- Four project theme colors: green, blue, purple, red for visual categorization

**State Management**
- TanStack Query (React Query) for server state management and API caching
- Local React state for UI interactions and role switching
- No global state management library - component-level state suffices for current complexity

**Data Fetching Strategy**
- Centralized API request functions in `lib/queryClient.ts`
- Custom query function with 401 handling behavior options
- Query keys follow REST endpoint patterns (`['/api/resource']`)
- Infinite stale time for queries (manual invalidation approach)
- Credentials included for session-based authentication

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API endpoints
- Separate development and production entry points (`index-dev.ts`, `index-prod.ts`)
- Custom request logging middleware tracking response times and JSON payloads
- JSON body parsing with raw body capture for webhook validation

**Development vs Production**
- Development mode: Vite middleware integration for HMR and client-side rendering
- Production mode: Static file serving from pre-built `dist/public` directory
- Environment-based configuration through NODE_ENV

**API Structure**
- RESTful endpoints organized in `routes.ts`
- CRUD operations for all major entities (teachers, projects, students, classes, etc.)
- Zod schema validation for request body parsing
- Consistent error handling with appropriate HTTP status codes
- Response format: JSON with error objects containing message field

**Session Management**
- Session storage using `connect-pg-simple` for PostgreSQL-backed sessions
- Cookie-based session authentication (infrastructure prepared but not fully implemented in visible code)

### Database Architecture

**ORM & Schema Definition**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via Neon serverless driver)
- Schema defined in `shared/schema.ts` for full-stack type sharing
- Drizzle Kit for schema migrations (output to `./migrations`)

**Database Schema**
- **Teachers**: User profiles with subject specialization, avatar, rating
- **Projects**: Core entity with title, subject, status, progress, theme, deadlines
- **Rubric Criteria**: Assessment criteria attached to projects with weight and level descriptions
- **Students**: User profiles with email, avatar, XP points, level
- **Achievements**: Gamification badges with titles, descriptions, XP rewards
- **Student Achievements**: Junction table tracking earned achievements
- **BNCC Competencies**: Brazilian curriculum standards reference data
- **Project Competencies**: Junction table linking projects to competencies
- **Submissions**: Student work submissions with file/link and comments
- **Classes**: Classroom organization with teacher assignments

**Data Access Pattern**
- Storage abstraction layer (`storage.ts`) defining interface contract
- All database operations return typed entities matching schema definitions
- UUID-based primary keys (varchar type)
- Foreign key relationships maintained through explicit ID references

### Role-Based Interface System

**Three User Roles**
- **Teacher**: Dashboard, class management, reports, rubric creation
- **Student**: Project portfolio, calendar, achievements, submission interface
- **Coordinator**: Kanban board for project oversight, teacher management, metrics

**Navigation Architecture**
- Single-page application with conditional rendering based on role state
- Shared sidebar component with role-specific menu items
- Tab-based navigation within each role's interface
- Landing page serves as entry point for role selection

**Component Organization**
- Page components organized by role: `pages/teacher/*`, `pages/student/*`, `pages/coordinator/*`
- Shared components: `AppSidebar`, `ProjectCard`, `SubmitEvidenceModal`, `BrandLogo`, `Icon`
- UI primitives in `components/ui/*` following shadcn/ui structure

### External Dependencies

**Core Libraries**
- `@neondatabase/serverless`: PostgreSQL database driver optimized for serverless environments
- `drizzle-orm` & `drizzle-kit`: Type-safe ORM and schema migration tools
- `express`: Web server framework
- `react` & `react-dom`: UI library
- `@tanstack/react-query`: Server state management
- `zod`: Runtime schema validation and TypeScript type inference
- `drizzle-zod`: Bridge between Drizzle schemas and Zod validation

**UI Component Dependencies**
- `@radix-ui/*`: 25+ primitive component packages for accessible UI
- `class-variance-authority`: Variant-based component styling
- `clsx` & `tailwind-merge`: Utility class composition
- `cmdk`: Command palette component
- `embla-carousel-react`: Carousel/slider functionality
- `react-hook-form` & `@hookform/resolvers`: Form state management
- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icon library

**Development Tools**
- `vite`: Build tool and dev server
- `typescript`: Type checking and compilation
- `tailwindcss`: Utility-first CSS framework
- `@replit/vite-plugin-*`: Replit-specific development enhancements
- `tsx`: TypeScript execution for development server
- `esbuild`: Production server bundling

**Third-Party Integrations**
- Google Fonts API: Outfit and Plus Jakarta Sans font families
- Neon Database: Serverless PostgreSQL hosting (connection via DATABASE_URL environment variable)
- Session store: PostgreSQL-backed session persistence via `connect-pg-simple`

**Build & Deployment**
- Build command: `vite build` for client + `esbuild` for server
- Production server: Single bundled ESM file at `dist/index.js`
- Static assets: Served from `dist/public`
- Database migrations: Manual execution via `drizzle-kit push`