# GreenPass Application Flowchart

This document contains a flowchart that visualizes the primary user and administrator flows within the GreenPass application.

```mermaid
graph TD
    subgraph Public Verification Flow
        A[User visits Homepage `/`] --> B{Enters Verification ID};
        B --> C[Navigates to `/verify/[id]`];
        C -- ID Found --> D[Display Member & Event Details];
        D --> E[Show Digital Certificate];
        C -- ID Not Found --> F[Display 'Verification Failed' message];
    end

    subgraph Admin Management Flow
        G[Admin visits `/admin`] --> H{Enters Credentials};
        H -- Successful Login --> I[Redirect to `/admin/dashboard`];
        H -- Failed Login --> H;
        
        I --> J{Admin Dashboard};
        J --> K[Overview: View Stats];
        J --> L[Approved Members: Search, Paginate, Edit, Delete];
        J --> M[Pending Members: Search, Paginate, Approve/Reject in Bulk];
        J --> N[Events: Add, Edit, Delete];
        J --> O[Certificates: Preview Certificate Designs];

        N -- Add/Edit Event --> P{Certificate Design Dialog};
        P --> Q[Customize BG, Colors, Signature];
        
        M -- Approve Member --> L;
        I --> R{Logout};
        R --> G;
    end
```
