# 📝 SaaS Task Manager

A full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## ✨ Features

### Core Features
- User authentication with JWT
- Secure password hashing with bcrypt
- Task CRUD operations (Create, Read, Update, Delete)
- User-specific tasks (each user sees only their own tasks)
- Dark mode toggle with localStorage persistence
- Responsive design for all devices

### Task Management
- **Priority Levels** - High, Medium, Low with color coding
- **Due Dates** - Calendar picker with overdue detection
- **Categories & Tags** - 5 predefined tags (Work, Personal, Shopping, Health, Other)
- **Search** - Real-time task search
- **Sort Options** - 5 sorting methods (date, priority, title, status, custom)
- **Drag & Drop** - Reorder tasks with custom sorting
- **Subtasks** - Break tasks into smaller steps with progress tracking
- **Task Notes** - Add detailed notes to tasks
- **Bulk Actions** - Select and manage multiple tasks at once
- **Task History** - View timeline of completed tasks

### Advanced Features
- **Task Templates** - Save and reuse task templates
- **Recurring Tasks** - Daily, weekly, or monthly auto-creation
- **Export** - Download tasks as CSV or PDF
- **Profile Management** - Update name, email, and password
- **Keyboard Shortcuts** - Quick actions (N for new task, / for search, Esc to close)

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Axios (HTTP client)
- React Context (state management)
- CSS3 with custom properties

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- jsPDF for PDF generation

---

## � Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Deeksha-Mane/SaaS-Task-Manager.git
cd task-manager
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` folder:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random
CLIENT_URL=http://localhost:5173
```

### 4. Run the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🏗️ Project Structure

```
task-manager/
├── client/                      # React frontend
│   ├── src/
│   │   ├── api/                # API integration
│   │   ├── components/         # Reusable components
│   │   ├── context/           # React Context
│   │   ├── pages/             # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth middleware
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── utils/                 # Utilities
│   ├── server.js              # Entry point
│   └── package.json
│
└── README.md
```

---

## � Security

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- User data isolation
- Environment variables for sensitive data

---

## 🎯 Planned Features

Future enhancements:
- Email reminders for tasks
- Google Calendar integration
- OAuth login (Google & GitHub)
- Mobile app
- Team collaboration
- Task attachments
- Advanced analytics

---

> 💡 _"You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.  
> &emsp;— **Bhagavad Gita**
> ---
Every competition taught me something new — teamwork, speed, pressure handling, and most importantly, consistency.

🎯 *Let the work be your worship, and excellence be your habit.*

