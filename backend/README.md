# Backend

This directory contains the server-side code for PAMS (Project Allocation and Management System).

## Project Structure

- `config/`: Contains configuration files, such as database connection settings (`db.js`).
- `data/`: Holds data files, potentially for seeding the database or for temporary use (e.g., `.xlsx`, `.csv` files).
- `middleware/`: Contains Express middleware functions for tasks like authentication (`authenticate.js`), authorization (`authorizeRoles.js`), and error handling (`errorManager.js`).
- `models/`: Defines the Mongoose schemas for database collections (e.g., `User.js`, `Team.js`, `ProjectBank.js`).
- `routes/`: Contains the API route definitions for different parts of the application (e.g., `auth.js`, `admin.js`, `common.js`).
- `uploads/`: A directory likely used for storing uploaded files.
- `index.js`: The main entry point for the backend server.
- `package.json`: Lists project dependencies and scripts for the backend.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn)
- MongoDB instance (running locally or a cloud-hosted one)

### Installation

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   # yarn install
   ```

3. Create a `.env` file in the `backend` directory and add the necessary environment variables (e.g., `PORT`, `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`). Refer to the configuration files and code for required variables.

### Running the Server

1. Start the development server:

   ```bash
   npm run dev
   # or
   # yarn dev
   ```

   (Assuming you have a `dev` script in your `package.json` like `"dev": "nodemon index.js"`)

   If not, you can use:

   ```bash
   node index.js
   ```

## API Endpoints

Refer to the files in the `routes/` directory for detailed API endpoint definitions. Key route files include:

- `auth.js`: Handles user authentication (login, registration, password reset).
- `admin.js`: Handles administrative functionalities (user management, data uploads).
- `common.js`: Potentially for shared endpoints accessible by multiple roles.

## Key Technologies

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL database.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **JSON Web Tokens (JWT)**: For user authentication.
- **bcryptjs**: For password hashing.
- **Nodemailer**: For sending emails (e.g., password reset).

## Environment Variables

Ensure the following environment variables are set in a `.env` file in this directory:

- `PORT`: The port on which the server will run (e.g., 5000).
- `MONGODB_URI`: Connection string for your MongoDB database.
- `JWT_SECRET`: Secret key for signing JWTs.
- `EMAIL_USER`: Gmail username for sending emails.
- `EMAIL_PASS`: Gmail password or app password for sending emails.
- `CLIENT_URL`: The base URL of the frontend application (e.g., `http://localhost:5173`).

(Add any other relevant environment variables here)
