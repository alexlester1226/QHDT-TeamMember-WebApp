Full-Stack Web Application
📌 Overview

This repository contains a full-stack web application with a React frontend and a Django backend.
The project supports user authentication, messaging, and real-time interaction, with a clean separation between frontend and backend codebases.

🗂️ Project Structure
.
├── frontend/       # React app (user interface)
├── backend/        # Django project (API + database logic)
├── env/            # Virtual environment (local only, not tracked)
└── README.md       # Project documentation

⚙️ Requirements
Frontend

Node.js (v18+ recommended)

npm or yarn

Backend

Python 3.10+

Django 4.x

Django REST Framework

SQLite (default) or PostgreSQL

🚀 Setup Instructions
1. Clone the Repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

2. Setup Backend (Django)
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Django server will start at:
👉 http://127.0.0.1:8000/

3. Setup Frontend (React)
cd frontend
npm install
npm start


React dev server will start at:
👉 http://localhost:3000/

🌐 Connecting Frontend & Backend

The React frontend communicates with the Django backend via REST API endpoints.

By default, API calls are proxied to http://127.0.0.1:8000/.

Configure .env in the frontend for custom backend URLs.

🧪 Features

🔑 User authentication (login/register)

💬 Messaging system between users

📡 Real-time updates (future WebSocket support)

⚡ REST API with Django REST Framework

🎨 Responsive UI with React

📝 To Do / Next Steps

Add production deployment setup (Docker or Vercel/Heroku).

Add tests for backend (PyTest / Django test framework).

Optimize frontend build for production.

👤 Author

Alex Lester
Queen’s University – Computer Engineering
