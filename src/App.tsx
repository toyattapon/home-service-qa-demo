import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleGuard } from './auth/RoleGuard';
import { CustomerDetailPage } from './features/customers/CustomerDetailPage';
import { CustomerFormPage } from './features/customers/CustomerFormPage';
import { CustomerListPage } from './features/customers/CustomerListPage';
import { AdminDashboardPage } from './features/dashboard/AdminDashboardPage';
import { DispatchPage } from './features/dispatch/DispatchPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { InvoiceDetailPage } from './features/invoices/InvoiceDetailPage';
import { InvoiceListPage } from './features/invoices/InvoiceListPage';
import { JobDetailPage } from './features/jobs/JobDetailPage';
import { JobFormPage } from './features/jobs/JobFormPage';
import { JobListPage } from './features/jobs/JobListPage';
import { LoginPage } from './features/auth/LoginPage';
import { NotFoundPage } from './features/system/NotFoundPage';
import { TechnicianJobDetailPage } from './features/technician/TechnicianJobDetailPage';
import { TechnicianJobListPage } from './features/technician/TechnicianJobListPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard role="admin" />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/customers" element={<CustomerListPage />} />
            <Route path="/admin/customers/new" element={<CustomerFormPage />} />
            <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/admin/customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="/admin/jobs" element={<JobListPage />} />
            <Route path="/admin/jobs/new" element={<JobFormPage />} />
            <Route path="/admin/jobs/:id" element={<JobDetailPage />} />
            <Route path="/admin/dispatch" element={<DispatchPage />} />
            <Route path="/admin/inventory" element={<InventoryPage />} />
            <Route path="/admin/invoices" element={<InvoiceListPage />} />
            <Route path="/admin/invoices/:id" element={<InvoiceDetailPage />} />
          </Route>
        </Route>
        <Route element={<RoleGuard role="technician" />}>
          <Route element={<AppLayout />}>
            <Route path="/tech/jobs" element={<TechnicianJobListPage />} />
            <Route path="/tech/jobs/:id" element={<TechnicianJobDetailPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
