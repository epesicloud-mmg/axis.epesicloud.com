# Maize Flour Production Management System

## Overview

This is a comprehensive web application for managing maize flour production and distribution operations. The system handles the complete workflow from raw maize delivery through quality control, production, warehousing, and final dispatch. Built as a SaaS platform, it provides role-based access control for different team members including Quality Control, Procurement, Production, Warehouse, and Dispatch teams.

The application features a modern React frontend with a clean, professional interface using shadcn/ui components, backed by an Express.js server with PostgreSQL database storage. The system integrates Replit's authentication service and provides real-time dashboard metrics and workflow tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas
- **Icons**: Lucide React icon library

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Middleware**: Custom logging, JSON parsing, and authentication middleware
- **Session Management**: Express session with PostgreSQL store

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Connection pooling via Neon's serverless driver

The database schema includes entities for:
- Users with role-based permissions
- Suppliers and truck deliveries
- Weighbridge readings and raw material batches
- Quality checks with contamination tracking
- Production orders and finished product batches
- Warehouse stock management
- Dispatch orders and items

### Authentication & Authorization
- **Provider**: Replit's OpenID Connect (OIDC) authentication service
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies with secure flags and CSRF protection
- **Role Management**: Database-stored user roles (Quality Control, Procurement, Production, Warehouse, Dispatch, Admin)

### Key Architectural Decisions
- **Monorepo Structure**: Shared schema definitions between client and server in `/shared` directory
- **Type Safety**: End-to-end TypeScript with shared types and Zod validation
- **Real-time Updates**: Optimistic updates with query invalidation for immediate UI feedback
- **Error Handling**: Centralized error handling with user-friendly messages and automatic re-authentication
- **Development Experience**: Hot module replacement in development with Vite integration

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Authentication**: OIDC-based authentication service integrated with Replit's platform
- **Replit Deployment**: Native integration with Replit's hosting and development environment

### Third-party Libraries
- **UI Components**: Radix UI primitives for accessible, headless components
- **Validation**: Zod for runtime type validation and schema generation
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **State Management**: TanStack Query for server state caching and synchronization
- **Development Tools**: Vite plugins for runtime error overlays and development tooling

### Optional Integrations
- **Weighbridge Systems**: Extensible architecture for integrating physical weighbridge equipment
- **ERP Systems**: API endpoints designed for integration with existing enterprise systems
- **Reporting Services**: Dashboard metrics designed for export to business intelligence tools