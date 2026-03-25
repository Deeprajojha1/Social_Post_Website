# PostApplication

A full-stack social posting app with authentication, media uploads, sharing, poll voting, notifications, and interactive feed actions.

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Cookie auth
- Media: Cloudinary

## Project Structure

```text
PostApplication/
  client/                      # React frontend (Vite)
    public/
    src/
      app/                     # Redux store setup
      components/              # Reusable UI parts (Navbar, PostCard, CreatePost)
      features/
        auth/                  # Auth slice + async actions
        post/                  # Post slice + async actions
      pages/                   # Feed, Login, Signup
      services/                # Axios API client
      App.jsx                  # App routes
      index.css                # Global styles
      main.jsx                 # React bootstrap
    package.json
    .gitignore

  server/                      # Express backend API
    src/
      config/                  # DB, env, cloudinary config
      controllers/             # Route handlers
      middleware/              # Auth, error, upload middleware
      models/                  # Mongoose models (User, Post)
      routes/                  # Auth and Post routes
      utils/                   # JWT and cookie helpers
      app.js                   # Express app setup
      server.js                # Entry point
    package.json

  README.md                    # This file
  .gitignore                   # Root gitignore
```

## Features Implemented

### Authentication

- User signup with name, email, password
- Login/logout with HTTP-only cookie-based JWT auth
- Current user fetch (`/api/auth/me`)
- Online users endpoint (excluding current user)

### Post Creation and Feed

- Create text/image/video posts
- Upload image/video to Cloudinary
- Emoji picker in post creation
- Feed tabs:
  - All Post
  - For You
  - Most Liked (filters out 0-like posts)
  - Most Commented (filters out 0-comment posts)
  - Most Shared (filters out 0-share posts)

### Post Interactions

- Like/unlike posts
- Comment on posts
- Toggle comments panel open/close
- Share post to online users
- Toast notifications for action success/failure

### Polls

- Create poll with question + options
- Polls are stored in database
- Users can vote by clicking an option
- Vote updates are supported (user can change vote)
- Vote count shown per option + total poll votes
- Selected option is highlighted for the current user

### Share Notifications

- Unread share count shown on navbar bell badge
- Unread share notifications are marked seen after feed view

### Delete Post (Protected)

- Backend enforces owner-only delete
- UI delete option appears only in `For You` tab and only for post owner

### UI/UX Improvements

- Better responsive behavior for mobile/tablet
- Media rendering constrained to avoid oversized images/videos
- Improved post action state visuals (liked, selected, etc.)

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/online`

### Posts

- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/upload`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comment`
- `POST /api/posts/:id/share`
- `POST /api/posts/:id/poll/vote`
- `DELETE /api/posts/:id`
- `GET /api/posts/shares/unread-count`
- `POST /api/posts/shares/seen`

## Environment Variables

Create `server/.env` with:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Optional CORS/frontend URL
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Run Locally

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Start backend

```bash
cd server
npm run dev
```

### 3. Start frontend

```bash
cd client
npm run dev
```
## Build Frontend

```bash
cd client
npm run build
```

## Notes

- Backend starts only after successful DB connection.
- Old users without a `name` still show via email fallback in UI.
- Polls created before poll persistence update may not have poll data.
