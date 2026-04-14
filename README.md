# QuantumVault Frontend Documentation

This document provides a detailed overview of the QuantumVault frontend application, covering its architecture, state management, component library, and utility functions.

## ✨ Premium Features

### 1. Adaptive Design System

- **Theme-Aware UI**: Full support for Light and Dark modes with dynamic asset switching (e.g., logo inversion).
- **Glassmorphism**: Modern UI elements with blurred overlays and sleek gradients.
- **Custom Loaders**: Hand-crafted loading animations matching the project's branding.

### 2. High-Fidelity PQC Management

- **Visual Versioning**: Every PQC key displays its version history and rotation status.
- **Action Verification**: Integrated confirmation flows for destructive actions (Disable, Rotate).
- **Dynamic Feedback**: Real-time toast notifications for all cryptographic operations.

## 🛠️ Technology Stack

- **Framework**: React 18 (Vite)
- **Styling**: Vanilla CSS with centralized design tokens.
- **Authentication**: Google OAuth with 2FA gating.
- **Security**: Session timeout enforced at 30 minutes of inactivity.

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Environment**: Copy `.env.example` to `.env` and set `VITE_API_URL`.
3. **Start Development**: `npm run dev`

## 🏗️ Architecture Overview

### 1. Global Context (`src/context/QuantumContext.jsx`)

The centralized engine for the application:
- **Auth Lifecycle**: Manages Google login, 2FA status, and manual/auto logout.
- **State Sync**: Automatically refreshes keys, policies, and logs upon authentication.
- **Centralized CRUD**: Standardized methods for interacting with all backend entities.

### 2. Components & Pages
- **`PQCKeys.jsx`**: The primary interface for managing quantum-secure assets.
- **`Policies.jsx`**: Orchestrates the mapping between auth keys and PQC keys.
- **`ActionMenu.jsx`**: A reusable, premium dropdown for contextual secondary actions.

## 🔄 Security Flows

### 2FA Verification
If a user has 2FA enabled, the frontend intercepts the login flow, requiring a valid TOTP code before granting access to global state.

### Key Rotation
The frontend manages the UX for rotation, ensuring that users understand the impact on existing policies while the backend handles the parameter regeneration.

## 🔧 Utilities

- **`api.js`**: Universal fetch wrapper with automatic JWT injection.
- **`idGenerator.js`**: Ensures unique identifiers for frontend-generated entities.
- **`dateFormatter.js`**: Localizes cryptographic timestamps.
