# Todo App with React Native

A full-stack mobile Todo application built with React Native, featuring user authentication, email verification, task management, and machine learning capabilities.

## Features

- **User Authentication**: Register, login with email/password
- **Security**: Email verification, password validation
- **Task Management**: Create, read, update, and delete tasks
- **ML Features**:
  - Task categorization based on content
  - Priority suggestions
  - Completion time estimation
  - Sentiment analysis
  - Productivity insights and recommendations
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

### Machine Learning
- Natural Language Processing for task categorization
- Sentiment analysis for task descriptions
- Time-based productivity analysis
- Smart task recommendations based on user patterns

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
├── backend/                     # Node.js backend
│   ├── controllers/             # Route controllers
│   ├── models/                  # MongoDB models
│   ├── routes/                  # API routes
│   ├── ml/                      # Machine learning services
│   │   ├── taskCategorizer.js   # Task categorization service
│   │   ├── smartRecommender.js  # Task recommendation engine
│   │   ├── sentimentAnalyzer.js # Sentiment analysis service
│   │   └── index.js             # ML services export
│   └── server.js                # Server entry point
│
├── frontend/                    # React Native application
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   └── TaskInsights.tsx # ML-powered insights component
│   │   ├── contexts/            # Context providers
│   │   ├── navigation/          # Navigation configuration
│   │   ├── screens/             # Screen components
│   │   ├── services/            # API services
│   │   │   └── ml.service.ts    # ML service interface
│   │   └── utils/               # Utility functions
│   ├── App.tsx                  # Root component
│   └── index.js                 # Entry point
```

## ML Features

### Task Categorization
The app automatically categorizes tasks based on their content using natural language processing. Categories include:
- Work
- Personal
- Health
- Education
- Finance
- Shopping

### Priority Suggestions
The system suggests appropriate priority levels for tasks by analyzing:
- Urgency keywords in the task description
- Deadlines
- Task importance indicators

### Completion Time Estimation
Tasks are automatically assigned estimated completion times based on:
- Task complexity indicators in the description
- Explicit time mentions
- Category-based time patterns

### Sentiment Analysis
The app analyzes the sentiment of task descriptions to:
- Detect user's emotional state regarding tasks
- Provide appropriate motivational messages
- Adjust UI elements based on task sentiment

### Productivity Insights
Users receive personalized productivity insights based on:
- Most productive time of day
- Most productive day of the week
- Task completion patterns
- Category efficiency

## License

This project is licensed under the MIT License. 