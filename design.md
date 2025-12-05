# Design Documentation – Vartalaap - The Chat App

## 1. Overview
Vartalaap is a real-time messaging platform built using the MERN stack and Socket.IO. The system supports private and group chat, media messaging, message deletion, read receipts, offline message delivery, typing indicators, and online/offline presence.

This document outlines design decisions, applied principles, and refactoring efforts done to improve system structure, scalability, maintainability, and performance.

---

## 2. System Goals
- Scalable & real-time messaging
- Smooth and optimized UI rendering
- Efficient state management & component communication
- Offline messages and read receipt synchronization
- File & media sharing
- Clean layered architecture for easy development
- Strong security with JWT authentication and authorization

---

## 3. High-Level Architecture
 - Frontend (React + Context API + Tailwind + Axios)
 - ↓ WebSocket / REST API
 - Backend (Node.js + Express + Socket.IO + JWT)
 - ↓
 - Database (MongoDB + Mongoose ODM)
 - ↓
 - Cloud Storage (Cloudinary)

 
---

## 4. Design Principles Applied

| Principle | Where Applied | Benefit |
|-----------|--------------|---------|
| **Single Responsibility Principle (SRP)** | Separate controllers for `users`, `messages`, `group`, `auth`, each API performs one job | Easier testing & debugging |
| **Open/Closed Principle (OCP)** | Modular socket event handlers, extendable conversation / group logic | Add new event types without rewriting existing ones |
| **Separation of Concerns** | Context for state, Socket layer, UI components, API services, backend controllers | Independent development and change without breaking others |
| **DRY (Don't Repeat Yourself)** | Reusable components: `Message`, `RecipientInfo`, `ChatProvider`, `MediaPreviewModal` | Reduced errors & code maintenance |
| **Fail Fast & Validation** | Mongoose model validation & middleware | Prevent inconsistent DB states |
| **Observer/Event Driven Design** | Socket events for updates & notifications | Efficient real-time behavior |
| **Caching & Virtualized UI** | Temporary message states, lazy population | Smooth scrolling & reduced API load |

---

## 5. How We Improved the Design of the Software

###   Moved from tightly coupled code to modular architecture
- Extracted business logic from components to backend controllers & socket services
- Introduced Context API to manage global chat state instead of prop drilling

###   Added offline message support
- `offlineMessages` queue ensures messages are delivered when a user reconnects
- Improved reliability and UX

###   Introduced read receipt synchronization
- Real-time read status over socket
- Updates user list and individual message threads

###   Improved media handling & deletion logic
- Added `media` array structure inside message schema
- Enabled delete single media and delete entire message feature

###   Improved performance and rendering
- Virtual rendering & auto scroll updates with `useRef`
- Optimized re-render control via dependency arrays and memoized functions

###   Meaningful state transitions for groups and members
- Sorting admins at top, group role changes, UI updates in real time

---

## 6. Key Refactoring Done

| Before Refactoring | After Refactoring | Improvement |
|-------------------|-------------------|-------------|
| Socket logic spread across components | Centralized socket event handlers in `ChatProvider` | Cleaner structure, easier maintainability |
| Re-rendering users on every message | Sorting users based on latest message | Efficient rendering |
| Duplicate logic for group & private chat | Generic message handlers and send/receive utilities | Higher code reusability |
| Message deletion not synced | Added `messageDeletedForEveryone` broadcast event | Instant UI update for all |
| State became inconsistent on refresh | Implemented `getConversations()` reset mechanism | Stable UI behavior |

---

## 7. Design Decisions Discussion
- **React Context API** instead of Redux → simpler global state, faster and clean
- **Socket.IO** chosen over WebRTC/Firebase → reliable persistent WebSocket channel
- **MongoDB (Schema-less flexibility)** supports dynamic features like group roles, profile pictures, media etc.
- **Cloudinary** external storage for large media avoiding server blockage
- **JWT-based authentication** for secured API protection

---



