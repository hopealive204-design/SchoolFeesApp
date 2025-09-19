# SchoolFees.NG - School Fee Management Platform

## Overview

SchoolFees.NG is a comprehensive SaaS platform designed for Nigerian schools to streamline fee collection, manage student payments, and reduce outstanding debt through AI-powered analytics and automated communication tools. The platform serves multiple user types including school administrators, parents, teachers, and staff members, providing role-based dashboards and functionality.

The system handles the complete lifecycle of school fee management from student enrollment and fee structure setup to payment processing and financial reporting. It integrates with popular Nigerian payment gateways and provides automated reminder systems to improve collection rates.

## Recent Changes

### September 19, 2025 - GitHub Import Setup Complete
- Successfully migrated SchoolFees.NG project from GitHub to Replit environment
- Verified project structure: React 19.1.1 + TypeScript + Vite + Tailwind CSS + DaisyUI
- Installed all npm dependencies (351 packages) including React, Vite, Tailwind, and DaisyUI
- Confirmed Vite configuration already optimized for Replit (host 0.0.0.0:5000, strictPort enabled)
- Set up Frontend workflow running `npm run dev` successfully on port 5000
- Resolved LSP TypeScript diagnostics (reduced from 326 to 1 remaining issue)
- Configured production deployment settings for autoscale with npm build and preview
- Verified landing page renders perfectly with all components and styling
- Project is fully functional and ready for development work

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19.1.1 with TypeScript for type safety and modern development experience
- **Styling**: Tailwind CSS with DaisyUI components for consistent design system
- **State Management**: React hooks with custom hooks for data management (useSchoolData, useThemeManager)
- **Routing**: Single-page application with view-based navigation system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Cloudflare Pages Functions (serverless)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage for document uploads and proof of payment files

### Data Storage Solutions
- **Primary Database**: Supabase PostgreSQL for relational data (students, payments, fees, schools)
- **Real-time Updates**: Supabase real-time subscriptions for live data synchronization
- **File Storage**: Supabase Storage for documents, receipts, and proof of payment uploads
- **Caching Strategy**: Browser-based caching with offline-first approach using mock data fallback

### Authentication and Authorization
- **Authentication Provider**: Supabase Auth with email/password authentication
- **Role-based Access**: Multi-role system supporting admin, parent, teacher, and staff roles
- **Session Management**: Persistent sessions with automatic token refresh
- **Impersonation**: Admin impersonation feature for customer support scenarios

### Key Architectural Decisions

**Multi-tenant Architecture**: Each school operates as a separate tenant with isolated data and custom branding, supporting both subdomain routing (school.schoolfees.ng) and shared hosting models.

**Role-based Dashboard System**: Different user roles (admin, parent, teacher, staff) receive tailored dashboard experiences with appropriate data access and functionality.

**Offline-first Design**: The application gracefully handles network failures by falling back to mock data, ensuring continuous operation during connectivity issues.

**Payment Gateway Abstraction**: Flexible payment processing supporting multiple Nigerian gateways (Paystack, Flutterwave) with configurable gateway selection per school.

**AI-powered Insights**: Integration with Google Gemini AI for debt analysis, automated communication generation, and predictive analytics to help schools improve collection rates.

**Communication Automation**: Multi-channel communication system supporting SMS and email with template management and automated reminder scheduling.

## External Dependencies

### Third-party Services
- **Supabase**: Database, authentication, real-time subscriptions, and file storage
- **Google Gemini AI**: AI-powered debt analysis, communication generation, and chatbot functionality
- **Cloudflare Pages**: Hosting platform with serverless functions for backend logic

### Payment Gateways
- **Paystack**: Primary payment gateway for card and bank transfer payments
- **Flutterwave**: Secondary payment gateway option for schools
- **Manual Bank Transfer**: Support for offline payment verification workflows

### Development Dependencies
- **React & React DOM**: Core frontend framework
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library built on Tailwind
- **Recharts**: Data visualization library for financial charts and analytics
- **Vite**: Build tool and development server
- **ESLint**: Code linting and quality assurance

### API Integrations
- **SMS Gateways**: Configurable SMS providers for automated reminders and notifications
- **Email Services**: SMTP integration for transactional emails and newsletters
- **WhatsApp Business API**: Optional integration for customer support communication

The architecture prioritizes scalability, reliability, and user experience while maintaining cost-effectiveness for schools of varying sizes across Nigeria.