# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build

## Project Architecture

### Overview
PoTENt is a Vue 3 web application that implements two quiz-style games:
1. **Top 10** - Single-player card-based quiz game
2. **Hacke Dicht** - Single and multiplayer quiz game (German "Who Wants to Be a Millionaire" style)

### Tech Stack
- Vue 3 with Composition API
- Vue Router for navigation
- Firebase (Firestore + Realtime Database) for multiplayer functionality
- TailwindCSS for styling
- Vite for build tooling

### State Management
The app uses reactive stores (not Vuex/Pinia):
- `gameStore` - Manages Top 10 decks and cards (localStorage)
- `hackeDichtStore` - Manages Hacke Dicht games and questions (localStorage)
- `lobbyStore` - Handles real-time multiplayer sessions (Firebase Realtime DB)
- `cloudStore` - Cloud synchronization features
- `playerStore` - Player data and authentication

### Key Components Structure

**Top 10 Game:**
- Gallery view to browse/create decks
- Editor for creating/editing card decks
- Play view for single-player gameplay

**Hacke Dicht Game:**
- Gallery for game templates
- Editor with 15 questions + multiple choice answers
- Single-player mode with jokers (50/50, Random Person, Reveal)
- Multiplayer mode with real-time voting via Firebase
- Mobile player view for multiplayer participants

### Authentication & Routing
- Simple localStorage-based authentication (`authenticated` key)
- Hash-based routing for GitHub Pages compatibility
- Mobile player routes bypass authentication for easy access

### Firebase Integration
Requires environment variables for Firebase config:
- `VITE_API_KEY`
- `VITE_AUTH_DOMAIN` 
- `VITE_PROJECT_ID`
- `VITE_DATABASE_URL`
- `VITE_STORAGE_BUCKET`
- `VITE_MESSAGESENDER_ID`
- `VITE_APP_ID`
- `VITE_MEASUREMENT_ID`

### Multiplayer Architecture
- Host creates lobby with QR code for mobile players
- Real-time synchronization via Firebase Realtime Database
- Vote aggregation and question progression
- Joker system with host controls
- Automatic cleanup on disconnect

### Audio System
- Background music and sound effects for quiz atmosphere
- Audio controls component for user preference management
- MP3 files stored in `/src/assets/audio/`