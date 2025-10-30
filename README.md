# HD Booking Frontend

This is a [Next.js](https://nextjs.org/) frontend for the hd booking application. It allows users to browse, select, and book experiences.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd hd-booking-frontend
    ```

2.  **Install dependencies:**
    The project uses `npm` (as indicated by `package-lock.json`).

    ```bash
    npm install
    ```

3.  **Create Environment File:**
    This project requires a connection to the backend API. Create a file named `.env.local` in the root of the project.

    ```bash
    touch .env.local
    ```

    Add the following variable, pointing to your running backend server's URL:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:4000
    ```

    (Update the URL if your backend runs on a different port or domain).

## Run Instructions

1.  **Ensure the Backend is Running:**
    This frontend cannot function without the backend server. Please start your `hd-booking-backend` project first.

2.  **Run the Development Server:**
    Use the `dev` script from `package.json`.

    ```bash
    npm run dev
    ```

3.  **Open the Application:**
    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.
