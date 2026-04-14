# Spotify Clone

A full-stack Spotify clone application with a Node.js backend and modern web frontend.

## Features

- User authentication (Login/Signup)
- Music player functionality
- Playlist management
- Song streaming

## Tech Stack

**Backend:**
- Node.js with Express.js
- MySQL database
- JWT authentication
- bcryptjs for password encryption

**Frontend:**
- HTML5
- CSS3
- JavaScript
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database

## Installation

```bash
# Install dependencies
npm install

# Create .env file with your database credentials
cp .env.example .env

# Run the server
npm start
```

## Development

```bash
# Run with nodemon for auto-reload
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=spotify_clone
JWT_SECRET=your_secret_key
PORT=5000
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/songs` - Get all songs
- `GET /api/playlists` - Get user playlists

## Deployment

Deployed on Render: [Your Deploy URL]

## License

ISC

## Author

Aman Mishra
