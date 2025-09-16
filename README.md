# Mini Buyer Lead Intake App

A full-stack web application for real estate teams to capture, manage, and analyze buyer leads.

## Tech Stack

**Backend:**
- Python Django + Django REST Framework
- MongoDB with MongoEngine
- JWT Authentication
- CSV Import/Export

**Frontend:**
- React + TypeScript
- Next.js 14 (App Router)
- Vite for fast development
- TailwindCSS for styling
- Zod for validation

## Features

- 🔐 JWT Authentication with demo login
- 📝 Lead creation with validation
- 🔍 Search, filter, and pagination
- 📊 Lead history tracking
- 📤 CSV import/export (≤200 rows)
- 🏠 Property type specific validations
- 👥 User ownership permissions

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MongoDB URI

# Run the server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Configuration

**Backend (.env):**
```
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Access the Application
- Frontend: http://localhost:5177
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

## Project Structure

```
├── backend/          # Django + MongoDB API
├── frontend/         # React + Next.js UI
└── README.md
```