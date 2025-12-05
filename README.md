# Vartalaap – Real-Time Chat Application
Smart, secure and scalable real-time messaging platform supporting personal chats, group chats, media sharing, and blocking system.

## Table of Contents
- Overview
- Features
- Tech Stack
- System Architecture
- Database Schema (High-Level)
- Folder Structure
- Installation & Setup
- Environment Variables
- Running the Project
- Real-time Socket Events
- Automated Testing Setup
- Future Enhancements


## Overview
Vartalaap is a full-stack real-time chat application built using MERN and Socket.IO.  
It supports 1:1 and group conversations, real-time online/offline status, typing indicators, media messaging, delete-for-everyone, and unread message counts.  
The system is designed with scalability in mind using optimized queries, message acknowledgment tracking, and persistent offline messages.

## Features
- User authentication with JWT 
- Google Authentication (Login/Signup)
- Real-time communication using Socket.IO
- Private Chats and Group Chats
- Media file support (Images, Videos, Audio)
- Message Status: Sent, Delivered, Read
- Delete message (For everyone / For me)
- Edit profile & change profile picture
- Block / Unblock user
- Unread message counter
- Typing indicator
- Online / Offline status
- Group roles (Admin / Member)
- Add / Remove members, Make Admin / Remove Admin
- Clear chats without deleting for others
- Cloud media storage using Cloudinary
- Offline message handling and syncing on reconnect
- Automatic conversation ordering (recent chats on top)
- Pagination and lazy loading for messages

## Tech Stack
### Frontend
React.js, Vite, Material-UI, Tailwind CSS, Axios, Socket.IO-Client

### Backend
Node.js, Express.js, Socket.IO, JWT, Multer, Cloudinary, Mongoose

### Database
MongoDB (Atlas)

### Testing
Jest, Supertest, Cypress

## System Architecture
Client → REST API → Backend → MongoDB  
Socket.IO (bidirectional real-time communication)

## Folder Structure
root/
│── client/
│── Server/
│── Backend-Testing/
│── Testing/
│── docs/
│── README.md

## Installation & Setup
Clone repository:
git clone <repo-url>
cd vartalaap

### Backend:
cd Server
npm install

### Frontend:
cd client
npm install

## Environment Variables
### Backend `.env`
MONGODB_URL = 
PORT = 
SECRET_KEY = 
REDIS_HOST = 
REDIS_PORT=
REDIS_PASSWD=
EMAIL_ID = 
EMAIL_PASSWD =
CLIENT_URL = 
CLOUD_NAME = 
CLOUD_API_KEY = 
CLOUD_SECRET_KEY = 
GOOGLE_CLIENT_ID = 
GOOGLE_CLIENT_SECRET = 

### Frontend `.env`
REACT_APP_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=

## Running Project
Backend → npm start  
Frontend → npm run dev

## Socket Events
newMessage, messageHasBeenReaded, wholeConversationIsReaded, typing, userCameOnline, userGoneOffline, messageDeletedForEveryone, updateReadReceipt

## Automated Tests
Backend:  npx jest  
Cypress:  npx cypress open

## Future Enhancements
Voice / Video Call
Cloud backup & restore
Message forwarding
Starred messages
Multi-device login
Message reactions