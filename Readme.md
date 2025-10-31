# StreamSphere Backend API

This repository contains the backend API for StreamSphere, a comprehensive video streaming platform built with Node.js, Express, and MongoDB. It provides a robust set of features for user management, video content, and social interactions.

## Features

-   **User Authentication**: Secure user registration and login using JWT (Access and Refresh Tokens) and password hashing with `bcrypt`.
-   **Video Management**: Full CRUD operations for videos, including uploading video files and thumbnails to Cloudinary.
-   **Subscriptions**: Users can subscribe to and unsubscribe from channels.
-   **Social Interactions**:
    -   Like and unlike videos, comments, and tweets.
    -   Post, update, and delete comments on videos.
-   **Playlists**: Create, update, delete, and manage video playlists.
-   **Tweets**: A simple tweeting feature for users.
-   **Dashboard**: Get channel statistics like total views, subscribers, likes, and videos.
-   **Profile Management**: Users can update their account details, avatars, and cover images.
-   **Watch History**: Tracks videos viewed by authenticated users.

## Technology Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JSON Web Tokens (JWT), Bcrypt
-   **File Storage**: Cloudinary for cloud-based media storage
-   **File Uploads**: Multer for handling `multipart/form-data`
-   **Environment Management**: `dotenv`
-   **Utilities**: `cookie-parser`, `cors`

## Project Structure

The project is organized into a modular structure for better maintainability and scalability.

```
/src
├── app.js               # Express app configuration and middleware setup
├── constants.js         # Project-wide constants
├── index.js             # Main application entry point
├── controllers/         # Request handling logic for each route
├── db/                  # Database connection logic
├── middlewares/         # Custom middlewares (e.g., auth, multer)
├── models/              # Mongoose schemas and models
├── routes/              # API route definitions
└── utils/               # Utility functions (e.g., API response, error handling, Cloudinary)
```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables. These are essential for the application to run correctly.

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
CORS_ORIGIN=*

DB_NAME=videotube

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v18.x or later)
-   npm or yarn
-   MongoDB instance (local or Atlas)
-   Cloudinary account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arpitchhabra23306/streamsphere-backend-api.git
    cd streamsphere-backend-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a `.env` file in the root directory.
    -   Copy the content from the [Environment Variables](#environment-variables) section and replace the placeholder values with your actual credentials.

4.  **Run the development server:**
    The server will start on the port specified in your `.env` file (default is 8000).
    ```bash
    npm run dev
    ```

## API Endpoints

All routes are prefixed with `/api/v1`. Routes marked with `(Protected)` require a valid JWT `accessToken` in the request headers (`Authorization: Bearer <token>`) or as a cookie.

### User Routes (`/users`)

| Method | Endpoint                    | Description                                | Protection |
| :----- | :-------------------------- | :----------------------------------------- | :--------- |
| `POST` | `/register`                 | Register a new user.                       | Public     |
| `POST` | `/login`                    | Log in a user and return tokens.           | Public     |
| `POST` | `/logout`                   | Log out the current user.                  | Protected  |
| `POST` | `/refresh-token`            | Generate a new access token.               | Public     |
| `POST` | `/change-password`          | Change the current user's password.        | Protected  |
| `GET`  | `/current-user`             | Get details of the logged-in user.         | Protected  |
| `PATCH`| `/update-account`           | Update user's full name and email.         | Protected  |
| `PATCH`| `/avatar`                   | Update user's avatar image.                | Protected  |
| `PATCH`| `/cover-image`              | Update user's cover image.                 | Protected  |
| `GET`  | `/c/:username`              | Get a user's channel profile.              | Protected  |
| `GET`  | `/history`                  | Get the user's watch history.              | Protected  |

### Video Routes (`/videos`)

| Method  | Endpoint                  | Description                          | Protection |
| :------ | :------------------------ | :----------------------------------- | :--------- |
| `GET`   | `/`                       | Get all videos with pagination/query.| Protected  |
| `POST`  | `/`                       | Publish a new video.                 | Protected  |
| `GET`   | `/:videoId`               | Get a single video by its ID.        | Protected  |
| `PATCH` | `/:videoId`               | Update video details (title, desc).  | Protected  |
| `DELETE`| `/:videoId`               | Delete a video.                      | Protected  |
| `PATCH` | `/toggle/publish/:videoId`| Toggle video's published status.     | Protected  |

### Comment Routes (`/comments`)

| Method  | Endpoint      | Description                           | Protection |
| :------ | :------------ | :------------------------------------ | :--------- |
| `GET`   | `/:videoId`   | Get all comments for a video.         | Protected  |
| `POST`  | `/:videoId`   | Add a new comment to a video.         | Protected  |
| `PATCH` | `/c/:commentId` | Update a comment.                     | Protected  |
| `DELETE`| `/c/:commentId` | Delete a comment.                     | Protected  |

### Like Routes (`/likes`)

| Method | Endpoint            | Description                 | Protection |
| :----- | :------------------ | :-------------------------- | :--------- |
| `POST` | `/toggle/v/:videoId`| Toggle like on a video.     | Protected  |
| `POST` | `/toggle/c/:commentId`| Toggle like on a comment.   | Protected  |
| `POST` | `/toggle/t/:tweetId` | Toggle like on a tweet.     | Protected  |
| `GET`  | `/videos`           | Get all liked videos by user. | Protected  |

### Playlist Routes (`/playlist`)

| Method  | Endpoint                        | Description                       | Protection |
| :------ | :------------------------------ | :-------------------------------- | :--------- |
| `POST`  | `/`                             | Create a new playlist.            | Protected  |
| `GET`   | `/user/:userId`                 | Get all playlists for a user.     | Protected  |
| `GET`   | `/:playlistId`                  | Get a single playlist by ID.      | Protected  |
| `PATCH` | `/:playlistId`                  | Update a playlist's details.      | Protected  |
| `DELETE`| `/:playlistId`                  | Delete a playlist.                | Protected  |
| `PATCH` | `/add/:videoId/:playlistId`     | Add a video to a playlist.        | Protected  |
| `PATCH` | `/remove/:videoId/:playlistId`  | Remove a video from a playlist.   | Protected  |

### Subscription Routes (`/subscriptions`)

| Method | Endpoint       | Description                                 | Protection |
| :----- | :------------- | :------------------------------------------ | :--------- |
| `GET`  | `/c/:channelId`| Get channels a user is subscribed to.       | Protected  |
| `POST` | `/c/:channelId`| Toggle subscription to a channel.           | Protected  |
| `GET`  | `/u/:subscriberId`| Get subscribers of a user's channel.  | Protected  |

### Tweet Routes (`/tweets`)

| Method  | Endpoint       | Description                     | Protection |
| :------ | :------------- | :------------------------------ | :--------- |
| `POST`  | `/`            | Create a new tweet.             | Protected  |
| `GET`   | `/user/:userId`| Get all tweets by a user.       | Protected  |
| `PATCH` | `/:tweetId`    | Update a tweet.                 | Protected  |
| `DELETE`| `/:tweetId`    | Delete a tweet.                 | Protected  |

### Dashboard Routes (`/dashboard`)

| Method  | Endpoint       | Description                     | Protection |
| :------ | :------------- | :------------------------------ | :--------- |
| `GET`   | `/stats`       | Get statistics for a channel.   | Protected  |
| `GET`   | `/videos`      | Get all videos for a channel.   | Protected  |
