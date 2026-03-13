import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import DeliveryTracking from "@/pages/delivery-tracking";
import QualityControl from "@/pages/quality-control";
import ProductionOrders from "@/pages/production-orders";
import Warehouse from "@/pages/warehouse";
import Weighbridge from "@/pages/weighbridge";
import Dispatch from "@/pages/dispatch";
import AuditLogs from "@/pages/audit-logs";
import Exceptions from "@/pages/exceptions";
import Users from "@/pages/users";
import Suppliers from "@/pages/suppliers";
import Customers from "@/pages/customers";
import Products from "@/pages/products";
import StorageLocations from "@/pages/storage-locations";
import ProductionWorkOrders from "@/pages/production-work-orders";
import ReceivingIntake from "@/pages/receiving-intake";
import StockMovements from "@/pages/stock-movements";
import Sidebar from "@/components/layout/sidebar";

// Generic Protected Route component
function ProtectedRoute({ component: Component, roles, ...rest }: any) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Redirect to="/" />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Component {...rest} />
      </main>
    </div>
  );
}

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="mt-4 text-slate-500">This module is currently being implemented according to the AXIS PRD.</p>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <div className="text-slate-500 font-medium">Loading AXIS...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {!isAuthenticated && <Route path="/" component={Landing} />}

      {/* Authenticated Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>

      {/* Admin / Mgmt */}
      <Route path="/users">
        <ProtectedRoute component={Users} roles={["Admin"]} />
      </Route>
      <Route path="/customers">
        <ProtectedRoute component={Customers} roles={["Admin", "Dispatch"]} />
      </Route>
      <Route path="/products">
        <ProtectedRoute component={Products} roles={["Admin", "Production Manager"]} />
      </Route>
      <Route path="/locations">
        <ProtectedRoute component={StorageLocations} roles={["Admin", "Warehouse / Inventory"]} />
      </Route>
      <Route path="/audit-logs">
        <ProtectedRoute component={AuditLogs} roles={["Admin", "Plant Manager"]} />
      </Route>
      <Route path="/exceptions">
        <ProtectedRoute component={Exceptions} roles={["Admin", "Plant Manager"]} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={() => <Placeholder title="Settings" />} roles={["Admin"]} />
      </Route>

      {/* Operations */}
      <Route path="/suppliers">
        <ProtectedRoute component={Suppliers} roles={["Admin", "Procurement"]} />
      </Route>
      <Route path="/delivery-tracking">
        <ProtectedRoute component={DeliveryTracking} />
      </Route>
      <Route path="/receiving/intake">
        <ProtectedRoute component={ReceivingIntake} roles={["Admin", "Receiving / Gate", "Warehouse / Inventory"]} />
      </Route>
      <Route path="/weighbridge">
        <ProtectedRoute component={Weighbridge} roles={["Admin", "Weighbridge Operator"]} />
      </Route>
      <Route path="/quality-control">
        <ProtectedRoute component={QualityControl} roles={["Admin", "Quality Control"]} />
      </Route>
      <Route path="/quality-control/released">
        <ProtectedRoute component={() => <Placeholder title="QC Released Batches" />} roles={["Admin", "Quality Control"]} />
      </Route>
      <Route path="/warehouse">
        <ProtectedRoute component={Warehouse} />
      </Route>
      <Route path="/warehouse/movements">
        <ProtectedRoute component={StockMovements} roles={["Admin", "Warehouse / Inventory", "Plant Manager"]} />
      </Route>

      {/* Production */}
      <Route path="/production-orders">
        <ProtectedRoute component={ProductionOrders} roles={["Admin", "Production Manager"]} />
      </Route>
      <Route path="/production/overview">
        <ProtectedRoute component={() => <Placeholder title="Production Overview" />} roles={["Admin", "Plant Manager"]} />
      </Route>
      <Route path="/production/bom">
        <ProtectedRoute component={() => <Placeholder title="BOM Management" />} roles={["Admin", "Production Manager"]} />
      </Route>
      <Route path="/production/operator">
        <ProtectedRoute component={ProductionWorkOrders} roles={["Admin", "Production Operator"]} />
      </Route>
      <Route path="/production/materials">
        <ProtectedRoute component={() => <Placeholder title="Production Material Issues" />} roles={["Admin", "Production Operator"]} />
      </Route>

      {/* Dispatch */}
      <Route path="/dispatch">
        <ProtectedRoute component={Dispatch} roles={["Admin", "Dispatch"]} />
      </Route>
      <Route path="/dispatch/pick">
        <ProtectedRoute component={() => <Placeholder title="Pick Lists" />} roles={["Admin", "Dispatch"]} />
      </Route>

      {/* Reporting */}
      <Route path="/analytics">
        <ProtectedRoute component={() => <Placeholder title="Analytics" />} roles={["Admin", "Plant Manager"]} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={() => <Placeholder title="Reports" />} roles={["Admin", "Plant Manager"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
