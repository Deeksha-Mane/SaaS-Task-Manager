# 🎯 TasQ - Smart Task Management

A modern, full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js). TasQ helps you organize, prioritize, and complete your tasks with powerful features and beautiful design.

---

## ✨ Features

### Task Management
- **Priority Levels** - High, Medium, Low with color coding
- **Task Status** - To Do, In Progress, Done
- **Due Dates** - Calendar picker with overdue detection
- **Categories & Tags** - 5 predefined tags (Work, Personal, Shopping, Health, Urgent)
- **Search** - Real-time task search
- **Sort Options** - 6 sorting methods (date, priority, title, status, due date, custom)
- **Drag & Drop** - Reorder tasks with custom sorting
- **Subtasks** - Break tasks into smaller steps with progress tracking
- **Task Notes** - Add detailed notes to tasks
- **Task Comments** - Add comments and discussions to tasks with timestamps
- **Bulk Actions** - Select and manage multiple tasks at once
- **Task History** - View timeline of completed tasks

### Advanced Features
- **Kanban Board View** - Visual board with 3 columns (To Do, In Progress, Done) and drag & drop between columns
- **Quick Filters** - Smart filters (Today, This Week, Overdue, Urgent, Completed Today)
- **Saved Views** - Save custom filter combinations for quick access
- **Task Templates** - Save and reuse task templates
- **Recurring Tasks** - Daily, weekly, or monthly auto-creation
- **Export** - Download tasks as CSV or PDF
- **Analytics Dashboard** - Visual insights with completion rates, priority distribution charts, and productivity metrics

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite (build tool)
- Axios (HTTP client)
- React Context (state management)
- Lucide React (icons)
- CSS3 with custom properties

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- jsPDF for PDF generation

---

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Deeksha-Mane/SaaS-Task-Manager.git
cd TasQ
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
TasQ/
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

## 🔑 Key Features Explained

### Kanban Board View
Switch between List and Board view with a single click. The Kanban board provides a visual workflow with three columns:
- **To Do** - Tasks that haven't been started
- **In Progress** - Tasks currently being worked on
- **Done** - Completed tasks

Drag and drop tasks between columns to update their status instantly.

### Quick Filters & Saved Views
- **Quick Filters**: One-click access to common views (Today, This Week, Overdue, Urgent, Completed Today)
- **Saved Views**: Save any combination of filters (status, priority, tags, sort) and access them instantly

### Task Comments
Add comments to tasks for discussions, updates, and collaboration. Each comment shows:
- Author name
- Timestamp
- Delete option

### Analytics Dashboard
Track your productivity with visual insights:
- Total tasks, completed, pending, completion rate
- Priority distribution chart
- Completion progress circle
- Success banner for 80%+ completion rate

---

## 🔒 Security

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
- Time tracking
- Advanced analytics

---

## 🚀 Deployment

The app is deployed and live:
- **Frontend**: https://saas-task-manager-flax.vercel.app
- **Backend**: https://saas-task-manager-mm9w.onrender.com

---

> 💡 _"You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.  
> &emsp;— **Bhagavad Gita**
> ---
Every competition taught me something new — teamwork, speed, pressure handling, and most importantly, consistency.

🎯 *Let the work be your worship, and excellence be your habit.*
