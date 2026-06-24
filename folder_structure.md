# Frontend Folder Structure

This document outlines the standard folder structure for the frontend application. It follows a scalable, feature-based architecture (or common modular architecture) suitable for modern React/React Native or other frontend frameworks.

```text
frontend/
├── src/                        # Main source code directory
│   ├── assets/                 # Static assets (images, icons, fonts, etc.)
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/             # Shared, reusable UI components (Buttons, Inputs, Modals, etc.)
│   │   ├── common/             # Truly generic components
│   │   └── layout/             # Layout specific components (Header, Footer, Sidebar)
│   │
│   ├── config/                 # Application configuration files (environment variables, constants)
│   │
│   ├── context/                # Global state management context (React Context API)
│   │
│   ├── hooks/                  # Custom reusable React hooks (e.g., useAuth, useFetch)
│   │
│   ├── navigation/             # Routing and navigation configuration (React Navigation, React Router)
│   │
│   ├── pages/                  # Page-level components (Screens in React Native, Routes in React JS)
│   │   ├── Home/
│   │   ├── Login/
│   │   └── Profile/
│   │
│   ├── services/               # API calls, third-party integrations, and network requests
│   │   ├── api.js              # Axios or Fetch configuration
│   │   └── authService.js
│   │
│   ├── store/                  # Redux/Zustand store setup, slices, and reducers (if applicable)
│   │
│   ├── styles/                 # Global styles, themes, colors, and typography (if using styled-components or global CSS)
│   │
│   ├── types/                  # TypeScript types and interfaces (if using TypeScript)
│   │
│   └── utils/                  # Helper functions and utility scripts (e.g., formatting dates, validation)
│
├── .env                        # Environment variables (do not commit)
├── .env.example                # Example environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project metadata and dependencies
└── README.md                   # Project documentation
```

## Directory Details

- **`assets/`**: Contains static files. These files are typically bundled by the build tool.
- **`components/`**: Reusable "dumb" or "presentational" components. They should ideally not contain complex business logic or fetch their own data.
- **`hooks/`**: Custom hooks for extracting reusable component logic.
- **`pages/` (or `screens/`)**: "Smart" or "container" components. These represent individual views/routes. They fetch data and pass it down to `components`.
- **`services/`**: Centralized place for interacting with external APIs or backend services.
- **`utils/`**: Pure functions that don't depend on React or external state. Easy to unit test.
- **`context/` / `store/`**: Global state management. Use `context` for simple, infrequently changing state (like theme or auth state), and `store` (Redux/Zustand) for complex, frequently changing application state.
