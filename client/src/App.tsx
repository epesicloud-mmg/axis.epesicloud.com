import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import DeliveryTracking from "@/pages/delivery-tracking";
import QualityControl from "@/pages/quality-control";
import ProductionOrders from "@/pages/production-orders";
import Warehouse from "@/pages/warehouse";
import Weighbridge from "@/pages/weighbridge";
import Dispatch from "@/pages/dispatch";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/delivery-tracking" component={DeliveryTracking} />
          <Route path="/quality-control" component={QualityControl} />
          <Route path="/production-orders" component={ProductionOrders} />
          <Route path="/warehouse" component={Warehouse} />
          <Route path="/weighbridge" component={Weighbridge} />
          <Route path="/dispatch" component={Dispatch} />
        </>
      )}
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
