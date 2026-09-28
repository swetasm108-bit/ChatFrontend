# Real-Time Chat Application — Frontend

A responsive real-time chat application built using **React, Vite, JavaScript, CSS, and Socket.IO Client**.

## Live Demo

**Frontend:** https://chat-frontend-sigma-puce.vercel.app/

**Backend:** https://chatbackend-7vdm.onrender.com

## GitHub

**Frontend Repository:**
https://github.com/swetasm108-bit/ChatFrontend

**Backend Repository:**
https://github.com/swetasm108-bit/ChatBackend

## Features

* Dummy username login
* Real-time messaging using Socket.IO
* Messages delivered instantly without page refresh
* Previous messages available after refresh
* Message timestamps
* Online/offline status
* Last-seen information
* Edit own messages
* 5-minute message editing limit
* Responsive chat interface
* Automatic scroll to latest message
* Socket connection error handling

## Tech Stack

* React
* Vite
* JavaScript
* CSS
* Socket.IO Client

## Project Structure

```text
ChatFrontend/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── socket.js
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## How It Works

The frontend communicates with the Node.js backend in two ways:

### REST API

REST API requests are used to load previously stored messages.

```text
React
  ↓
GET /api/messages/:roomId
  ↓
Express Backend
  ↓
MongoDB
  ↓
Chat History
```

### Socket.IO

Socket.IO is used for real-time communication.

```text
User
  ↓
React
  ↓
Socket.IO
  ↓
Node.js Backend
  ↓
Socket.IO Room
  ↓
Other Users
```

Messages are saved by the backend and then broadcast to users connected to the same room.

## Dummy Authentication

The assignment requires dummy authentication, so this project uses a username-only login.

No password or production authentication system is implemented.

The username is stored in browser local storage and is used as the sender name.

## Online / Offline Status

Socket.IO connection and room events are used to display the other user's presence.

The chat can display:

```text
Online
```

or:

```text
Offline
Last seen: <time>
```

## Message Editing

Users can edit their own messages within **5 minutes** of sending them.

The backend validates ownership and the editing time before updating the message.

## Environment Variables

The current frontend does not require environment variables.

The application connects to the deployed backend:

```text
https://chatbackend-7vdm.onrender.com
```

No database credentials or secret keys are stored in the frontend repository.

## Local Setup

### Requirements

* Node.js
* npm
* Git

### Clone Repository

```bash
git clone https://github.com/swetasm108-bit/ChatFrontend.git
```

### Open Project

```bash
cd ChatFrontend
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application normally runs at:

```text
http://localhost:5173
```

## Testing

1. Open the application in two browser windows.
2. Login with two different usernames.
3. Join the same chat room.
4. Send a message.
5. Verify that it appears instantly in the other browser.
6. Refresh and verify that previous messages remain.
7. Close one browser and check offline/last-seen status.
8. Reconnect and verify online status.
9. Test message editing.

## Design Decisions

### React

React is used for building the user interface and managing application state.

### Socket.IO

Socket.IO provides real-time, bidirectional communication without polling.

### REST API

REST APIs are used to retrieve persistent chat history.

### Local Storage

Local storage is used to maintain the dummy username between page refreshes.

### Responsive UI

CSS media queries are used to make the chat interface usable on different screen sizes.

## Assumptions

* Dummy username authentication is sufficient for the assignment.
* The current demonstration uses a fixed chat room.
* No production authentication system is implemented.
* Messages are persisted in MongoDB through the backend.
* Message editing is limited to 5 minutes.

## Author

**Sweta Mishra**

Built as a real-time chat application assignment using React, Node.js, Socket.IO, and MongoDB.
