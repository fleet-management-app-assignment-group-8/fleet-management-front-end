/**
 * Comprehensive TypeScript type definitions for Fleet Management App
 * 
 * This file consolidates all type definitions used across the application
 * to ensure type safety and consistency.
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
  avatar: string;
  phone?: string;
  jobTitle?: string;
}

export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive';

// ============================================================================
// VEHICLE TYPES
// ============================================================================

export interface Vehicle extends Record<string, unknown> {
  id: string;
  make: string;
  model: string;
  year: number;
  license: string;
  status: VehicleStatus;
  driver: string;
  location: string;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
  mileage: number;
  color?: string;
  fuelType?: FuelType;
}

export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'offline';
export type FuelType = 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid';

// ============================================================================
// DRIVER TYPES
// ============================================================================

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: DriverStatus;
  vehicle: string;
  licenseExpiry: string;
  rating: number;
  totalTrips: number;
  hoursThisWeek: number;
  joinDate: string;
  licenseNumber?: string;
}

export type DriverStatus = 'active' | 'off-duty' | 'unavailable';

// ============================================================================
// TRIP TYPES
// ============================================================================

export interface Trip {
  id: string;
  vehicle: string;
  driver: string;
  status: TripStatus;
  startLocation: string;
  endLocation: string;
  startTime: string;
  estimatedArrival: string;
  actualDistance: string;
  estimatedDistance: string;
  progress: number;
  priority: Priority;
}

export type TripStatus = 'in_progress' | 'completed' | 'scheduled' | 'delayed';
export type Priority = 'critical' | 'urgent' | 'high' | 'medium' | 'normal' | 'low';

// ============================================================================
// MAINTENANCE TYPES
// ============================================================================

export interface MaintenanceItem {
  id: string;
  vehicle_id: string;
  type: string;
  description?: string;
  status: MaintenanceStatus;
  priority: Priority;
  due_date: string;
  scheduled_date?: string;
  completed_date?: string;
  current_mileage: number;
  due_mileage: number;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  assigned_technician?: string;
  notes?: string;
  parts_needed?: any;
  attachments?: any;
  created_at?: string;
  updated_at?: string;
}

export type MaintenanceStatus = 
  | 'overdue' 
  | 'due_soon' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed'
  | 'cancelled';

// ============================================================================
// FUEL TYPES
// ============================================================================

export interface FuelData {
  vehicle: string;
  driver: string;
  currentLevel: number;
  weeklyConsumption: number;
  monthlyCost: number;
  efficiency: number;
  lastRefuel: string;
  status: FuelStatus;
}

export type FuelStatus = 'normal' | 'low' | 'critical';

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface VehicleFormState extends Record<string, unknown> {
  make: string;
  model: string;
  year: string;
  license: string;
  color: string;
  fuelType: FuelType;
  mileage: string;
}

export interface DriverFormState {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export interface UserFormState {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
  jobTitle: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface PerformanceMetric {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface ChartDataPoint {
  month: string;
  consumption: number;
  cost?: number;
  utilization?: number;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface Report {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType;
  lastGenerated: string;
  schedule: string;
  category: ReportCategory;
}

export type ReportCategory = 'performance' | 'maintenance' | 'fuel' | 'all';

export interface ScheduledReport {
  name: string;
  schedule: string;
  nextRun: string;
  status: 'active' | 'inactive';
}

export interface RecentReport {
  name: string;
  date: string;
  size: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

// ============================================================================
// BADGE CONFIG TYPES
// ============================================================================

export interface BadgeConfig<T extends string = string> {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export type StatusConfigMap<T extends string> = Record<T, BadgeConfig<T>>;

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

export interface FilterOptions {
  searchQuery?: string;
  statusFilter?: string;
  roleFilter?: string;
  categoryFilter?: string;
  periodFilter?: string;
}

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export interface Activity {
  id?: number;
  user: string;
  action: string;
  time: string;
  type: ActivityType;
  vehicle?: string;
  driver?: string;
  issue?: string;
  alert?: string;
}

export type ActivityType = 
  | 'login' 
  | 'update' 
  | 'registration' 
  | 'permission'
  | 'trip_completed'
  | 'trip_started'
  | 'maintenance_due'
  | 'fuel_alert';

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface VehicleStatusCount {
  status: string;
  count: number;
  color: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface SortOptions<T = string> {
  field: T;
  order: SortOrder;
}

