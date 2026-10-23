# Implementation Plan: Aplikasi Penilaian & Presensi Siswa SMP

## Architecture Overview

```mermaid
flowchart LR
    subgraph Frontend["React.js Frontend"]
        A["React 18 + Vite"]
        B["React Router v6"]
        C["Axios HTTP Client"]
        D["Tailwind CSS"]
        E["React Context Auth"]
    end
    subgraph Backend["C# .NET 8 REST API"]
        F["ASP.NET Core Web API"]
        G["Entity Framework Core"]
        H["JWT Authentication"]
        I["Full-Text Search"]
        J["Queue Service"]
    end
    subgraph DB["Database"]
        K["SQL Server / PostgreSQL"]
    end
    A --> F
    F --> G --> K
    F --> H
    F --> I
    F --> J
end
```

## Backend Structure (C# .NET 8)
- **Clean Architecture**: Controllers → Services → Repositories → EF Core
- **RESTful API Queue**: Background job queue for heavy operations (report generation, bulk operations)
- **Query Optimization**: EF Core with projection, pagination, includes, compiled queries
- **Search Engine**: Full-text search with weighted scoring across entities

## Frontend Structure (React.js)
- **Vite** for build tooling
- **React Router** for multi-role navigation
- **Tailwind CSS** for styling
- **Role-based routing** and conditional UI rendering

## Phase Breakdown

### Phase 1: Backend API
1. Project setup (.NET 8 Web API)
2. Entity models + DbContext + Migrations
3. JWT Authentication
4. CRUD Controllers with soft delete protection
5. Search engine service
6. Background queue service
7. Grade calculation services

### Phase 2: Frontend
1. Vite + React setup
2. Auth context & login page
3. Admin dashboard & master data pages
4. Teacher grade & attendance input
5. Student read-only views
6. Homeroom teacher recapitulation
7. Report generation

> [!IMPORTANT]
> Key Technical Requirements:
> - RESTful API Queue (BackgroundService for report PDF generation)
> - Query Optimizing (EF Core projections, pagination, compiled queries, indexed columns)
> - Search like search engine (weighted full-text search across students, teachers, subjects)
