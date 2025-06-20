# Information Architecture Map

This document defines the complete route hierarchy for the Employer-facing dashboard, 
showing access levels and nested relationships.

## Route Hierarchy Diagram

```mermaid
graph TD
    A["/"] --> B["/login (PUBLIC)"]
    A --> C["/dashboard (EMPLOYER)"]
    A --> D["/company-profile (EMPLOYER)"]
    D --> D1["/company-profile/new (EMPLOYER)"]
    D --> D2["/company-profile/edit (EMPLOYER)"]
    A --> E["/jobs (EMPLOYER)"]
    E --> E1["/jobs/new (EMPLOYER)"]
    E --> E2["/jobs/[id] (EMPLOYER)"]
    E2 --> E2a["/jobs/[id]/edit (EMPLOYER)"]
    E2 --> E2b["/jobs/[id]/applicants (EMPLOYER)"]
    E2b --> E2b1["/jobs/[id]/applicants/[applicantId] (EMPLOYER)"]
```

## Access Level Legend

- **PUBLIC**: Accessible to all users (unauthenticated)
- **EMPLOYER**: Requires authentication and EMPLOYER role

## Route Nesting Structure

```
/
├── login (PUBLIC)
└── authenticated routes (EMPLOYER-only)
    ├── dashboard
    ├── company-profile/
    │   ├── (view profile)
    │   ├── new
    │   └── edit
    └── jobs/
        ├── (list all jobs)
        ├── new
        └── [id]/
            ├── (job detail view)
            ├── edit
            └── applicants/
                ├── (list applicants)
                └── [applicantId] (applicant detail)
```

## Notes

- All routes except `/login` require EMPLOYER authentication via AWS Amplify Auth
- Dynamic routes use Next.js bracket notation: `[id]`, `[applicantId]`
- Company profile creation (`/new`) is only shown if no profile exists
- Job and applicant management follows standard CRUD patterns
