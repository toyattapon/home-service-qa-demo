export type UserRole = 'admin' | 'technician';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  technicianId?: string;
}

export type AcType =
  | 'Wall Type'
  | 'Cassette'
  | 'Floor Standing'
  | 'Portable';
export type BtuSize = 9000 | 12000 | 18000 | 24000;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  acBrand?: string;
  btu: BtuSize;
  acType: AcType;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  address: string;
  acBrand?: string;
  btu: BtuSize;
  acType: AcType;
  note?: string;
}

export interface Technician {
  id: string;
  userId: string;
  name: string;
  phone: string;
  active: boolean;
  skillTags: string[];
}

export type ServiceType = 'Cleaning' | 'Repair' | 'Installation';
export type JobPriority = 'Normal' | 'Urgent';
export type JobStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';
export type TimeSlot =
  | '08:00-10:00'
  | '10:00-12:00'
  | '13:00-15:00'
  | '15:00-17:00';

export interface UsedPart {
  inventoryItemId: string;
  quantity: number;
}

export interface Job {
  id: string;
  customerId: string;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  numberOfUnits: number;
  priority: JobPriority;
  problemDescription?: string;
  status: JobStatus;
  usedParts: UsedPart[];
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  technicianName?: string;
  invoiceId?: string;
}

export interface CreateJobInput {
  customerId: string;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: TimeSlot;
  technicianId?: string;
  numberOfUnits: number;
  priority: JobPriority;
  problemDescription?: string;
}

export interface JobFilters {
  status?: JobStatus;
  search?: string;
  date?: string;
  technicianId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  safetyStock: number;
  unitCost: number;
  lowStock?: boolean;
}

export type InvoiceStatus = 'Unpaid' | 'Paid';

export interface Invoice {
  id: string;
  jobId: string;
  serviceFee: number;
  urgentSurcharge: number;
  partsCost: number;
  subtotal: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  receiptNo?: string;
  createdAt: string;
  paidAt?: string;
  customerName?: string;
  serviceType?: ServiceType;
}

export interface InvoiceCalculation {
  serviceFee: number;
  urgentSurcharge: number;
  partsCost: number;
  subtotal: number;
  vat: number;
  total: number;
}

export interface DashboardSummary {
  totalJobsToday: number;
  pendingJobs: number;
  assignedJobs: number;
  completedJobs: number;
  unpaidInvoices: number;
  lowStockItems: number;
}
