# QHDT Team Member Web Application

## 📌 Overview
The QHDT (Queen's Hyperloop Design Team) Team Member Web Application is a full-stack platform designed to facilitate team management, communication, and project tracking. It features a robust React-based frontend and a highly modular Django backend, enabling user authentication, team collaboration through memos, timeline tracking, and posts.

## 🗂️ Project Architecture
The repository is split into two primary domains to enforce a clean separation of concerns:
- **`frontend/`**: A React application utilizing Material-UI (`@mui/material`) for modern, responsive UI components and `axios` for RESTful API communication.
- **`backend/`**: A Django project segmented into multiple specialized internal apps (users, teams, memos, posts, timeline) built with Django REST Framework (DRF) to serve API endpoints efficiently.

## ⚙️ Technology Stack
### Frontend
- **Framework**: React.js (v18)
- **Routing**: React Router DOM (v6)
- **Styling & UI**: Material-UI (MUI v5), Emotion
- **HTTP Client**: Axios

### Backend
- **Framework**: Python 3.10+, Django 4.x, Django REST Framework
- **Database**: SQLite (default, drop-in replaceable with PostgreSQL)
- **Authentication**: Custom token-based authentication via DRF and custom hashing

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/QHDT-TeamMember-WebApp.git
cd QHDT-TeamMember-WebApp
```

### 2. Run the Backend (Django)
Open a terminal window and navigate to the backend directory:
```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The Django server will run at: **http://127.0.0.1:8000/**

*Note: Default Admin Credentials are provided in `admin.txt`.*

### 3. Run the Frontend (React)
Open a second terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
npm start
```
The React development server will start at: **http://localhost:3000/**

## 🌐 API & Integration
The React frontend communicates directly with the Django backend via REST API endpoints defined in `backend/core/api/urls.py`. By default, API calls are directed to `http://127.0.0.1:8000/`. You can configure a `.env` file in the frontend for custom environment-specific backend URLs. Cross-Origin Resource Sharing (CORS) is explicitly enabled for `localhost:3000` via `django-cors-headers`.

## 🧑‍💻 Documentation for Developers
If you are a Senior SWE or an LLM trying to grok the internal architecture of the application, please refer entirely to [understanding.md](understanding.md) for a comprehensive, in-depth architectural breakdown!

## 📝 To-Do / Next Steps
- Implement WebSockets for real-time live messaging.
- Add comprehensive PyTest coverage for Django endpoints.
- Dockerize the application for streamlined CI/CD & containerized deployments to Vercel/Heroku.

## 👤 Author
**Alex Lester**
Queen’s University – Computer Engineering
