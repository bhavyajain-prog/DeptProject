# Project Allocation Process and Evaluation

This project is a web application designed to manage and streamline the process of allocating projects to students and subsequently evaluating them. It caters to different user roles: Admin, Sub-Admin, Mentor, and Student.

## Overview

The system allows administrators to manage users (students, mentors, sub-admins), upload project banks, and oversee the allocation process. Mentors can view their assigned teams and projects, and evaluate student progress. Students can view available projects, form teams, select project preferences, and view their allocated projects and evaluations.

## Monorepo Structure

This repository is structured as a monorepo containing two main parts:

- **`backend/`**: Contains the Node.js, Express.js, and MongoDB backend server. See `backend/README.md` for more details.
- **`frontend/`**: Contains the React (with Vite) frontend application. See `frontend/README.md` for more details.

## Core Features

- **User Authentication & Authorization**: Secure login for different roles with role-based access control.
- **User Management (Admin)**: Admins can add, edit, delete, and manage students, mentors, and sub-admins.
- **Project Bank Management (Admin)**: Admins can upload and manage a list of available projects.
- **Team Formation & Project Selection (Student)**: Students can form teams and indicate their project preferences.
- **Project Allocation (Admin/System)**: Mechanism for allocating projects to student teams (details of automation TBD).
- **Evaluation Management (Mentor/Admin)**: Mentors can evaluate student teams; Admins can oversee evaluations.
- **First Login Password Change**: Users are prompted to change their password upon their first login.

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd project-allocation-process-and-evaluation
    ```

2. **Set up the Backend:**

    - Navigate to the `backend` directory: `cd backend`
    - Follow the instructions in `backend/README.md` to install dependencies, set up environment variables (including database connection and email service), and start the backend server.

3. **Set up the Frontend:**

    - Navigate to the `frontend` directory: `cd ../frontend` (if you are in `backend`)
    - Follow the instructions in `frontend/README.md` to install dependencies, set up environment variables (pointing to the backend API), and start the frontend development server.

4. **Access the Application:**
    - Once both frontend and backend servers are running, you can typically access the application at `http://localhost:5173` (or the port Vite is running on).

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT)
- bcryptjs
- Nodemailer

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS (likely)

## Contribution

(Details on how to contribute, coding standards, branch strategy, etc., can be added here if this were an open project.)

## License

(Specify the license for the project, e.g., MIT, Apache 2.0, or proprietary.)
