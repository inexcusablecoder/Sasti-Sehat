# System Architecture & Technical Specifications — Sasti-Sehat

This document outlines the system architecture, component breakdown, data flow, and database schema for **Sasti-Sehat**, an AI-powered healthcare price transparency platform.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    User([User / Patient]) -->|HTTPS / REST| ReactFE[React Frontend Client]
    ReactFE -->|API Requests / JWT| NodeBE[Node.js / Express Backend]
    
    subgraph Core Backend & Data Layer
        NodeBE -->|SQL Queries / ORM| PostgresDB[(PostgreSQL Database)]
        NodeBE -->|File Uploads / Images| ObjectStore[Cloud Storage / S3 / Local Storage]
    end

    subgraph AI Engine & R&D Pipelines
        NodeBE -->|Document & Image Payload| AIService[AI Engine / Model Service]
        AIService -->|OCR & Vision AI| BillParser[Bill Parser & Line Item Extractor]
        AIService -->|Cost Prediction LLM| PriceEstimator[Cost Benchmark & Anomaly Model]
    end

    subgraph External Integrations
        NodeBE -->|Geocoding / Maps| MapsAPI[Maps & Location Service]
    end
```

---

## 2. Technology Stack Breakdown

| Tier | Technology | Purpose | Responsible Lead |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js (Vite / CRA), Tailwind CSS / Vanilla CSS | Client-side web interface, interactive UI, state management | **NIKHIL Mengade** |
| **UI/UX Design & Backend** | Figma, Node.js, Express.js | UI Wireframes, design system, RESTful API server & auth | **SHREYASH LAGHANE** |
| **Database** | PostgreSQL, Prisma ORM / pg-pool | Relational data store for hospitals, treatments, users, and bill logs | **SHREYASH LAGHANE** |
| **AI Engine** | Python / Node AI SDK, Tesseract OCR / Vision Models | Medical bill scanning, pricing anomaly detection, LLM analysis | **HARSH KATE** |
| **R & D** | Data Scraping, Healthcare Price Benchmarking | Data collection, pricing algorithm validation, market research | **OM VITEKAR** |

---

## 3. Component Details & Responsibilities

### 3.1 Frontend Architecture (React.js)
*Lead: NIKHIL Mengade | Design: SHREYASH LAGHANE*

- **Modular Component Hierarchy**:
  - `components/common/`: Reusable UI elements (Buttons, Cards, Modals, Loading Skeletons).
  - `components/bill-analyzer/`: Drag-and-drop file uploader, interactive bill breakdown, anomaly badges.
  - `components/search/`: Hospital & procedure search bar with auto-complete and filters.
  - `components/comparator/`: Side-by-side hospital cost comparison tables and interactive charts.
- **State Management & Data Fetching**:
  - Global State: React Context API or Redux Toolkit for auth user session and active bill state.
  - Server State: TanStack Query (React Query) or Axios for efficient API caching and error handling.
- **Routing**: React Router v6 for client-side navigation (`/`, `/search`, `/compare`, `/analyze-bill`, `/dashboard`).

---

### 3.2 Backend Architecture (Node.js / Express.js)
*Lead: SHREYASH LAGHANE*

- **API Layer**: Express Router handling REST API routes versioned under `/api/v1/`.
- **Key Modules**:
  - `auth/`: User registration, login, JWT token generation, role-based access control.
  - `treatments/`: Search procedures, fetch average cost benchmarks by region.
  - `hospitals/`: Query hospital profiles, listed services, transparent cost breakdowns, and ratings.
  - `bills/`: Handle multipart bill image/PDF uploads, queue processing, store results.
  - `ai/`: Proxy requests to the AI engine for OCR extraction and cost analysis.

---

### 3.3 Database Schema (PostgreSQL)

```mermaid
erDiagram
    USERS ||--o{ BILL_ANALYSES : uploads
    HOSPITALS ||--o{ HOSPITAL_TREATMENTS : offers
    TREATMENTS ||--o{ HOSPITAL_TREATMENTS : categorizes
    BILL_ANALYSES ||--o{ BILL_ITEMS : contains

    USERS {
        uuid id PK
        string full_name
        string email
        string password_hash
        string city
        timestamp created_at
    }

    HOSPITALS {
        uuid id PK
        string name
        string city
        string address
        string rating
        boolean is_verified
    }

    TREATMENTS {
        uuid id PK
        string code
        string title
        string category
        decimal avg_cost_national
    }

    HOSPITAL_TREATMENTS {
        uuid id PK
        uuid hospital_id FK
        uuid treatment_id FK
        decimal cost_min
        decimal cost_max
        decimal cost_avg
    }

    BILL_ANALYSES {
        uuid id PK
        uuid user_id FK
        string original_filename
        string file_url
        decimal total_claimed_amount
        decimal ai_estimated_fair_amount
        string status
        timestamp uploaded_at
    }

    BILL_ITEMS {
        uuid id PK
        uuid bill_analysis_id FK
        string item_description
        decimal charged_amount
        decimal benchmark_amount
        boolean is_overpriced
    }
```

---

### 3.4 AI Engine Architecture
*Lead: HARSH KATE*

1. **Document Processing & OCR**:
   - Converts uploaded bill images/PDFs into structured raw text.
   - Extracts billing line items, hospital names, dates, and itemized costs.
2. **Medical Price Anomaly Detection**:
   - Compares parsed line-item costs against PostgreSQL reference benchmarks.
   - Identifies duplicate charges, inflated consumable costs, or unbundled billing codes.
3. **AI Recommendation & Explainer**:
   - Generates natural language summaries explaining potential overcharges and suggested negotiation points for patients.

---

### 3.5 Research & Development (R&D) Pipeline
*Lead: OM VITEKAR*

- **Data Sourcing & Normalization**: Gathering government health scheme rates, crowd-sourced bill data, and published hospital tariffs.
- **Price Range Algorithms**: Developing statistical models (percentiles, regional cost variance factors) to ensure accurate "fair price" estimates.
- **Compliance & Privacy**: Ensuring patient bill uploads sanitize personal health information (PHI) before AI processing.

---

## 4. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | User login & JWT issuance |
| `GET` | `/api/v1/treatments` | Search procedures & pricing benchmarks |
| `GET` | `/api/v1/hospitals` | List hospitals with filters (city, rating, procedure) |
| `GET` | `/api/v1/hospitals/:id/costs` | Get itemized treatment costs for a hospital |
| `POST` | `/api/v1/bills/upload` | Upload medical bill (image/PDF) for AI analysis |
| `GET` | `/api/v1/bills/:id` | Retrieve AI analysis report for a bill |

---

## 5. Security & Performance Considerations

1. **JWT & RBAC**: Secure authentication for patients and platform admins.
2. **Data Encryption**: Sensitive user data encrypted in PostgreSQL at rest and via TLS in transit.
3. **Rate Limiting**: Express rate limiting on API endpoints to prevent abuse.
4. **CORS & Helm**: Security headers enabled via `helmet` and strict CORS policies.
