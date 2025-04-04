# Todo App with React Native

A full-stack mobile Todo application built with React Native, featuring user authentication, email verification, and task management.

## Features

- **User Authentication**: Register, login with email/password
- **Security**: Email verification, password validation
- **Task Management**: Create, read, update, and delete tasks
- **UI/UX**: Modern Material Design interface with dark/light theme support
- **Offline Mode**: Work without internet connection
- **Cross-Platform**: Works on both iOS and Android

## Tech Stack

### Frontend
- React Native
- React Navigation
- React Native Paper (UI components)
- Context API for state management
- TypeScript

### Backend
- Node.js
- Express
- MongoDB
- JWT authentication

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/todo-react-native.git
   cd todo-react-native
   ```

2. Install dependencies
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Start the backend server
   ```bash
   cd backend
   npm start
   ```

4. Start the React Native application
   ```bash
   cd frontend
   npx react-native run-android
   # or for iOS:
   npx react-native run-ios
   ```

## Project Structure

```
todo-react-native/
├── backend/              # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── server.js         # Server entry point
│
├── frontend/             # React Native application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # Context providers
│   │   ├── navigation/   # Navigation configuration
│   │   ├── screens/      # Screen components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── App.tsx           # Root component
│   └── index.js          # Entry point
```

## License

This project is licensed under the MIT License. 