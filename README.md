# Real-Time Chat App

This is a simple real-time chat application built with React and Socket.IO.

Users can log in with a username and chat with another user. Messages appear instantly without refreshing the page.

## Features

* Login with a username
* Send and receive messages instantly
* Messages stay after refreshing the page
* Message timestamps
* Online and offline status
* Last seen
* Edit messages within 5 minutes
* Simple and responsive chat design

## Technologies Used

* React
* Vite
* JavaScript
* CSS
* Socket.IO Client

## How It Works

The frontend connects to the backend using Socket.IO.

When a user sends a message, it is sent to the server and then delivered to the users in the chat room instantly.

Previous messages are loaded from the backend when the user opens the chat.

## Live Demo

https://chat-frontend-sigma-puce.vercel.app/

## How to Run Locally

Clone the project:

git clone 

Go to the project folder:

cd ChatFrontend

Install the required packages:

npm install

Start the project:

npm run dev

Open the app in your browser:

http://localhost:5173

## Environment Variables

No environment variables are required for the frontend.

The frontend is connected to the deployed backend.

## Project Structure

src/

* App.jsx
* App.css
* socket.js
* main.jsx

## Note

This project uses a simple username login for the assignment. It is not a full authentication system.
