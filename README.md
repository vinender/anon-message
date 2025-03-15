AnonMessage Platform

Welcome to AnonMessage, a full-stack web application that allows users to send and receive anonymous messages. Inspired by platforms like Sarahah, this project aims to provide a secure and user-friendly environment for anonymous communication.
Table of Contents

    Demo
    Features
    Tech Stack
    Prerequisites
    Installation
    Backend Setup
    Frontend Setup
    Environment Variables
    Running the Application
    Project Structure
    API Endpoints
    Screenshots
    Contributing
    License
    Contact

Demo

Live Demo Link (if available)
Features

    User Authentication: Secure sign-up and login functionality with JWT authentication.
    Anonymous Messaging: Send and receive messages without revealing identity.
    Message Analysis: Integrates OpenAI's API to analyze messages for inappropriate content.
    Dashboard: Personalized dashboard displaying incoming and sent messages.
    Shareable Link: Unique link for each user to receive anonymous messages.
    Responsive Design: Mobile-friendly interface using Tailwind CSS.
    Security Measures: Password hashing, protected routes, and input validation.

Tech Stack
Frontend

    Next.js: React framework for server-side rendering and static site generation.
    React: JavaScript library for building user interfaces.
    Tailwind CSS: Utility-first CSS framework for rapid UI development.

Backend

    Node.js: JavaScript runtime environment.
    Express.js: Web framework for Node.js.
    MongoDB: NoSQL database for data storage.
    Mongoose: ODM for MongoDB.
    JWT: For secure authentication.
    OpenAI API: For message content analysis.

Prerequisites

    Node.js: Version 14.x or higher.
    npm: Node package manager.
    MongoDB: Local or hosted MongoDB instance.
    OpenAI API Key: Obtain from OpenAI.

Installation
1. Clone the Repository



git clone https://github.com/your-username/anonmessage.git
cd anonmessage

Backend Setup
1. Navigate to the Backend Directory



cd backend

2. Install Dependencies



npm install

3. Configure Environment Variables

Create a .env file in the backend directory:



touch .env

Add the following variables:

env

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

4. Start the Backend Server



npm run dev

The backend server should now be running on http://localhost:5000.
Frontend Setup
1. Navigate to the Frontend Directory



cd ../frontend

2. Install Dependencies



npm install

3. Configure Environment Variables

Create a .env.local file in the frontend directory:



touch .env.local

Add the following variables:

env

NEXT_PUBLIC_API_BASE_URL=${process.env.NEXT_PUBLIC_API_BASE_URL}

4. Start the Frontend Server



npm run dev

The frontend server should now be running on http://localhost:3000.
Environment Variables
Backend (backend/.env)

    PORT: Port number for the backend server (default is 5000).
    MONGODB_URI: Connection string for your MongoDB database.
    JWT_SECRET: Secret key for JWT authentication.
    OPENAI_API_KEY: API key for OpenAI integration.

Frontend (frontend/.env.local)

    NEXT_PUBLIC_API_BASE_URL: Base URL for the backend API (e.g., ${process.env.NEXT_PUBLIC_API_BASE_URL}).

Running the Application

    Backend: Ensure MongoDB is running and start the server with npm run dev in the backend directory.
    Frontend: Start the Next.js development server with npm run dev in the frontend directory.
    Open your browser and navigate to http://localhost:3000.

Project Structure

lua

anonmessage/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── index.js
│   └── package.json
└── frontend/
    ├── components/
    ├── context/
    ├── pages/
    ├── public/
    ├── styles/
    ├── .env.local
    ├── next.config.js
    └── package.json

Backend Directories

    controllers: Contains controller functions for handling requests.
    middleware: Authentication and other middleware functions.
    models: Mongoose schemas and models.
    routes: API route definitions.
    utils: Utility functions, including OpenAI integration.

Frontend Directories

    components: Reusable React components.
    context: React context for authentication.
    pages: Next.js pages for routing.
    styles: Global and component-specific styles.

API Endpoints
Authentication

    POST /api/auth/signup: Register a new user.
    POST /api/auth/login: Authenticate a user and retrieve a JWT.

Messages

    POST /api/messages: Send an anonymous message.
    GET /api/messages: Get messages received by the authenticated user.
    GET /api/messages/sent: Get messages sent by the authenticated user.

Screenshots
1. Sign-Up Page

2. Login Page

3. Dashboard

4. Shareable Link

Contributing

Contributions are welcome! Please follow these steps:

    Fork the repository on GitHub.
    Clone your forked repository locally.
    Create a new branch for your feature or bug fix.
    Commit your changes with clear and descriptive messages.
    Push your branch to your forked repository.
    Open a Pull Request against the main branch of the original repository.

License

This project is licensed under the MIT License.
Contact

    Name: Your Name
    Email: your.email@example.com
    GitHub: your-username

Additional Information
Security Considerations

    Password Hashing: User passwords are hashed using bcrypt before storing in the database.
    JWT Authentication: JSON Web Tokens are used to secure API endpoints.
    Input Validation: Basic validation is implemented on both client and server sides.
    Content Analysis: Messages are analyzed using OpenAI's API to prevent inappropriate content.

Known Issues

    Rate Limits: Be mindful of OpenAI's rate limits and API usage policies.
    Error Handling: Some error messages may not be user-friendly and need improvement.
    Accessibility: Additional work is needed to improve accessibility features.

Future Enhancements

    Password Recovery: Implement functionality for users to reset their passwords.
    Profile Customization: Allow users to customize their profiles with avatars and bio.
    Notifications: Real-time notifications for new messages.
    Advanced Content Filtering: Improve message analysis with custom models or additional criteria.

Setting Up MongoDB

You can use a local MongoDB instance or a hosted service like MongoDB Atlas.
Using MongoDB Atlas

    Create an Account: Sign up at MongoDB Atlas.
    Create a Cluster: Follow the prompts to create a new cluster.
    Whitelist Your IP: Allow your IP address to access the cluster.
    Get Connection String: Replace <username> and <password> in the connection string.
    Update .env File: Set MONGODB_URI in your backend .env file.

Tips for Development

    Use Nodemon: Automatically restart the server on code changes.

    

    npm install -g nodemon
    nodemon index.js

    Install VSCode Extensions: Enhance your development experience with extensions like ESLint, Prettier, and Tailwind CSS IntelliSense.

Common Errors and Solutions
OpenAI API Errors

    Issue: Error: Request failed with status code 429.
    Solution: You've hit the rate limit. Slow down your requests or check your OpenAI usage.

CORS Issues

    Issue: Access-Control-Allow-Origin errors.

    Solution: Ensure CORS is properly configured in your backend server.js.

    javascript

    app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      })
    );

MongoDB Connection Errors

    Issue: MongoNetworkError: failed to connect to server.
    Solution: Verify your MONGODB_URI, network connection, and that your IP is whitelisted if using MongoDB Atlas.

Learning Resources

    Next.js Documentation: https://nextjs.org/docs
    Express.js Documentation: https://expressjs.com/en/guide/routing.html
    MongoDB Mongoose Guide: https://mongoosejs.com/docs/guide.html
    Tailwind CSS Documentation: https://tailwindcss.com/docs
    OpenAI API Reference: https://beta.openai.com/docs/api-reference/introduction

Acknowledgments

    OpenAI: For providing the API used in message analysis.
    Tailwind CSS: For the utility-first CSS framework.
    Community Contributors: For inspiration and code examples.

Thank you for checking out AnonMessage! If you have any questions or feedback, feel free to reach out.