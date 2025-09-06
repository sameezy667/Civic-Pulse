# Civic Issue Platform

A comprehensive civic engagement platform that allows citizens to report issues and enables government departments to manage and resolve them efficiently.

## Features

- **Citizen Portal**: Report issues, track status, upload photos
- **Admin Dashboard**: Manage reports, assign departments, track progress  
- **Interactive Map**: Visualize issues geographically
- **Real-time Updates**: Live status tracking and notifications
- **Multi-department Management**: Route issues to appropriate departments
- **Authentication**: Secure login for citizens and administrators

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Supabase
- **Database**: PostgreSQL (via Supabase)
- **Maps**: Leaflet.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
civic-issue-platform/
├── frontend/civic-pulse-frontend/    # React frontend application
├── backend/                          # Node.js backend services
├── backend-supabase/                # Supabase configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd civic-issue-platform
```

2. Install frontend dependencies
```bash
cd frontend/civic-pulse-frontend
npm install
```

3. Install backend dependencies
```bash
cd ../../backend
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in both frontend and backend directories
- Fill in your Supabase credentials

5. Start the development servers
```bash
# Frontend
cd frontend/civic-pulse-frontend
npm start

# Backend
cd ../../backend
npm start
```

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
