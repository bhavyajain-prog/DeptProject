# Frontend

This directory contains the client-side React application for PAMS (Project Allocation and Management System).

## Project Structure

- `public/`: Contains static assets that are publicly accessible.
- `src/`:
  - `assets/`: Images, fonts, and other static assets used within the application.
  - `components/`: Shared UI components used across multiple features (e.g., `Header.jsx`, `Loading.jsx`).
  - `contexts/`: React Context API providers for global state management (e.g., `AuthContext.jsx`).
  - `features/`: Contains modules for specific application features, often following a feature-sliced design pattern.
    - `admin/`: Components and logic related to the admin panel.
    - `auth/`: Components for authentication (Login, Register, Reset Password).
    - `mentor/`: Components for the mentor dashboard/portal.
    - `student/`: Components for the student dashboard/portal.
    - `teams/`: Components related to team management and viewing.
  - `pages/`: Top-level page components (e.g., `DevPortal.jsx`, `NotFound.jsx`).
  - `routing/`: Components and configuration related to application routing (e.g., `RoleBasedRoute.jsx`).
  - `services/`: Modules for interacting with external services, like the backend API (e.g., `axios.js` for configured Axios instance).
  - `App.jsx`: The main application component, setting up routes and global layout.
  - `main.jsx`: The entry point for the React application, rendering the root component.
  - `App.css`: Global styles for the application.
- `eslint.config.js`: ESLint configuration file for code linting.
- `index.html`: The main HTML file that the browser loads.
- `package.json`: Lists project dependencies and scripts for the frontend.
- `vite.config.js`: Configuration file for Vite, the build tool.
- `vercel.json`: Configuration for deploying to Vercel (if applicable).

## Getting Started

### Prerequisites

- Node.js and npm (or yarn)
- A running instance of the backend server.

### Installation

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   # yarn install
   ```

3. Create a `.env` file in the `frontend` directory if you need to override default environment variables (e.g., `VITE_API_BASE_URL`). Vite uses `VITE_` prefix for environment variables exposed to the client.

### Running the Development Server

1. Start the Vite development server:

   ```bash
   npm run dev
   # or
   # yarn dev
   ```

   This will typically start the application on `http://localhost:5173`.

## Key Technologies & Libraries

- **React**: JavaScript library for building user interfaces.
- **Vite**: Fast frontend build tool.
- **React Router DOM**: For client-side routing and navigation.
- **Axios**: For making HTTP requests to the backend API.
- **Tailwind CSS** (likely, based on class names seen previously): Utility-first CSS framework.
- **ESLint**: For code linting and maintaining code quality.

## Environment Variables

- `VITE_API_BASE_URL`: The base URL for the backend API (e.g., `http://localhost:5000/api`). This should be set in a `.env` file in the `frontend` directory.

(Add any other relevant environment variables here)

## Building for Production

To create a production build:

```bash
npm run build
# or
# yarn build
```

This will generate optimized static assets in the `dist` folder.
