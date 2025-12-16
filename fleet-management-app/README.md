# 🚗 Fleet Management System

A comprehensive B2B fleet management solution built with Next.js 15, React 18, and TypeScript.

## 📋 Overview

This application provides a complete fleet management solution for businesses, featuring:

- **Dashboard Overview** - Real-time fleet statistics and insights
- **Vehicle Management** - Track and manage your fleet vehicles
- **Driver Management** - Manage driver profiles and assignments
- **Trip Management** - Monitor routes and trip history
- **Maintenance Tracking** - Schedule and track vehicle maintenance
- **Fuel Management** - Monitor fuel consumption and costs
- **Analytics & Reports** - Comprehensive data visualization and reporting
- **User Management** - Role-based access control (Admin/Employee)


> ⚠️ **Important:** This application uses client-side authentication suitable only for development and demos. See [Authentication Documentation](./README.AUTH.md) for production deployment.

## 🏗️ Architecture

### Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Build Tool:** Turbopack

### Project Structure

```
fleet-management-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication routes
│   │   │   └── login/
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── vehicles/        # Vehicle management
│   │   │   ├── drivers/         # Driver management
│   │   │   ├── trips/           # Trip tracking
│   │   │   ├── maintenance/     # Maintenance logs
│   │   │   ├── fuel/            # Fuel management
│   │   │   ├── analytics/       # Analytics & insights
│   │   │   ├── reports/         # Report generation
│   │   │   ├── users/           # User management (admin)
│   │   │   ├── profile/         # User profile
│   │   │   ├── settings/        # App settings
│   │   │   ├── layout.tsx       # Dashboard layout
│   │   │   └── loading.tsx      # Global loading state
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Root redirect
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── analytics/           # Analytics components
│   │   ├── auth/                # Authentication components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── user/                # User-related components
│   │   └── constants/           # Mock data
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Authentication state
│   └── middleware.ts.backup     # Middleware template (disabled)
├── docs/                        # Documentation
│   └── AUTHENTICATION.md        # Auth integration guide
├── public/                      # Static assets
├── README.AUTH.md               # Auth status & quick reference
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fleet-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Mock Login Credentials

For demo purposes, you can use any email/password combination:

- **Admin Access:** Select "Admin" role
- **Employee Access:** Select "Employee" role

## 📦 Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production with Turbopack
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔐 Authentication

### Current State: Development Mode

The application currently uses **client-side mock authentication** suitable only for development and demos.

**Features:**
- ✅ Mock login functionality
- ✅ Role-based UI (Admin/Employee)
- ✅ Client-side route protection
- ✅ Session persistence (localStorage)

**Limitations:**
- ❌ NOT secure for production
- ❌ No server-side validation
- ❌ No real user database

### Production Deployment

For production deployment with real authentication:

1. **Read the authentication guide:** [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)
2. **Integrate Keycloak or another IDP** following the provided guide
3. **Enable server-side middleware** for route protection
4. **Configure proper session management**

See [README.AUTH.md](./README.AUTH.md) for quick reference.

## 🎨 Features

### Dashboard Overview
- Real-time fleet statistics
- Active vehicles count
- Available drivers
- Ongoing trips
- Recent alerts and notifications

### Vehicle Management
- Add, edit, and delete vehicles
- Track vehicle status (Active, Maintenance, Inactive)
- Monitor mileage and fuel levels
- Vehicle assignment and history

### Driver Management
- Driver profiles and contact information
- License verification tracking
- Performance metrics
- Trip assignment

### Trip Management
- Route planning and tracking
- Trip history and logs
- Distance and duration tracking
- Driver and vehicle assignments

### Maintenance Management
- Schedule preventive maintenance
- Track maintenance history
- Cost tracking
- Service reminders

### Fuel Management
- Fuel consumption tracking
- Cost analysis
- Efficiency metrics
- Refueling history

### Analytics
- Fuel consumption trends
- Vehicle utilization rates
- Maintenance cost analysis
- Performance metrics
- Custom date range filtering

### Reports
- Generate comprehensive reports
- Export capabilities (planned)
- Custom report filters
- Data visualization

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Core UI components
- ✅ Mock data implementation
- ✅ Client-side routing
- ✅ Basic authentication flow
- ✅ Dashboard and management interfaces

### Phase 2: Backend Integration (Planned)
- [ ] Keycloak authentication
- [ ] Advanced RBAC
- [ ] REST API integration
- [ ] Real database connectivity
- [ ] Server-side validation
- [ ] API route protection

### Phase 3: Advanced Features (Planned)
- [ ] Test Cases

Thank you!