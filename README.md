# Interior Renovation Admin Dashboard

A comprehensive administrative dashboard for managing interior renovation projects, designers, and home owners. Built with React, TypeScript, and Vite.

## Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd interior-renovation
npm install
```

### 3. Running the Application

The project uses a multi-server setup for different data domains. You can start everything concurrently:

```bash
npm run dev:all
```

This will launch:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Auth API**: [http://localhost:3001](http://localhost:3001)
- **Interior Designers API**: [http://localhost:3002](http://localhost:3002)
- **Home Owners API**: [http://localhost:3003](http://localhost:3003)

### 4. Start access with Credentials

- **Admin**: admin@example.com / admin123
- **Super Admin**: superadmin@example.com / super123

---

## JSON Server Configuration

The project utilizes `json-server` to mock a backend environment.

- **Storage**: Data is persisted in several JSON files located in `src/data/`:
  - `db.json`: User accounts and authentication data.
  - `interior_designers.json`: List of designers and their profiles.
  - `home_owners.json`: Home owner records and project details.
- **Port Mapping**:
  - `3001`: Authentication (uses `json-server-auth`).
  - `3002`: Designer management.
  - `3003`: Home owner management.
- **Custom Script**:
  - `server.cjs` configures the authentication middleware and endpoints.

---

## Authentication Mechanism

The application implements a secure, role-based authentication flow.

- **System**: Powered by `json-server-auth` middleware integrated into a custom Node.js server (`server.cjs`).
- **Flow**:
  1. User submits credentials via the `/login` endpoint on port 3001.
  2. The server validates and returns a **JWT (JSON Web Token)**.
  3. The token is stored in the browser's `localStorage`.
- **Authorization**:
  - An **Axios Interceptor** automatically attaches the JWT to the `Authorization` header (`Bearer <token>`) for all subsequent API requests.
  - **Protected Routes**: Client-side routing is secured using `ProtectedRoute` and `AdminRoute` components to prevent unauthorized access.
- **Roles**:
  - `admin`: Access to Dashboard, Designers, and Home Owners pages. They can create and edit records but **do not have permission to delete** designers or home owners.
  - `superadmin`: Full access across the entire platform, including user management via the Super Admin Panel and the ability to delete any record.

---

## Project Structure

The project follows a modular directory structure to maintain high scalability and clear separation of concerns:

- `src/api/`: Contains domain-specific API service functions (Axios logic).
- `src/components/`: Reusable UI components and specialized route guards (`ProtectedRoute`, `AdminRoute`).
- `src/data/`: JSON data files and the core `db.json` used by the mock servers.
- `src/models/`: TypeScript definitions for data structures across the app.
- `src/pages/`: Directory-per-feature architecture. Each folder contains the main page component and its related sub-components.
- `src/store/`: Global state management using **React Context API** (Auth and Theme).
- `src/routes/`: Centralized routing configuration.

---

## Architectural Decisions

1.  **Modular Page Architecture**: Each major feature (Dashboard, Designers, Home Owners, Super Admin) is encapsulated within its own directory under `src/pages`. This separation ensures that logic, styles, and components related to a specific domain are isolated and manageable.
2.  **State Management (Context API)**: The application use the native **React Context API** paired with `useReducer` and `useState` for state management. This avoids external dependencies while providing powerful, reactive state sharing for:
    - `authStore.tsx`: Manages user sessions, role-based metadata, and authentication state globally.
    - `themeStore.tsx`: Handles application-wide theme preferences (Dark/Light mode).
3.  **Service-Oriented API Layer**: All external communications are abstracted into an `src/api` layer. Each domain has its own service file (e.g., `authApi.ts`, `interiorDesignerApi.ts`), utilizing a shared Axios instance with interceptors for automatic JWT injection.
4.  **Component-Based Layout System**: The application uses a `MainLayout` component that wraps protected pages, providing consistent navigation, sidebar, and header across different administrative views.
5.  **Type-Safe Data Modeling**: Fundamental data structures are defined in `src/models`, ensuring strict TypeScript enforcement across the UI, stores, and API responses.
6.  **Protected Routing Patterns**: Navigation is managed via `react-router-dom` using high-order components (`ProtectedRoute` and `AdminRoute`) to enforce role-based access before rendering page content.
7.  **MUI Design System**: We leverage **Material UI** for its robust and customizable component library, ensuring a responsive, professional, and consistent across all devices.

---

## Trade-offs Made

- **JSON Server vs. Production Database**: We opted for `json-server` for rapid development and zero-configuration database setup. While excellent for prototyping, it lacks ACID compliance and advanced relational queries.
- **LocalStorage for JWT**: We used `localStorage` for simplicity and ease of access across the application. For high-security production apps, `HttpOnly` cookies would be used to mitigate XSS risks.
- **Multiple API Instances**: Running three separate JSON servers allows for cleaner data separation but adds minimal overhead in dev environment management handled by `concurrently`.
- **Client-Side Permissioning**: While the UI enforces role-based visibility, the mock nature of JSON Server means we rely heavily on client-side logic for the "Super Admin" features.

---

## Future Improvements

With more time and resources, the following features are planned for implementation:

1.  **Downloadable Reports**: Ability for admins to export home owner and designer data into PDF or Excel formats for offline analysis.
2.  **Referral Program**: Implementation of reference codes for new home owners. Referrers will earn rewards or discounts, helping to grow the renovation community.
3.  **Enhanced Security**: Migration from `localStorage` to `HttpOnly` cookies for better security.
4.  **Brand-Aligned UI Colors**: Research and implement a consistent color system aligned with the project’s brand identity, accessibility standards, and overall user experience.
5.  **Scalable State Management**: Refactor global state handling from React Context API to Redux to better manage complex application state, improve scalability, and maintain predictable data flow as the application grows.
