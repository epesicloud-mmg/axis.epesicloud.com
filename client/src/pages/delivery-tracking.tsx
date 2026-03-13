import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import DeliveryForm from "@/components/forms/delivery-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Truck, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TruckDelivery, Supplier } from "@shared/schema";

export default function DeliveryTracking() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<TruckDelivery[]>({
    queryKey: ["/api/deliveries"],
    retry: false,
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    retry: false,
  });

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/deliveries/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending_receipt":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "weighed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pending_qc":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "expected":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading Deliveries...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Tracking</h1>
            <p className="text-slate-500 mt-1">Manage inbound truck deliveries and supplier scheduling.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-primary-500/20 transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Register Truck
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">New Delivery Registration</DialogTitle>
              </DialogHeader>
              <DeliveryForm
                suppliers={suppliers}
                products={products}
                onSuccess={() => {
                  setShowForm(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Deliveries Grid */}
        {deliveriesLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-white/50 rounded-3xl overflow-hidden">
            <CardContent className="p-20 text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No active deliveries</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Register an expected truck or manage current arrivals at the gate.</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-xl px-8 h-12 border-slate-200 text-slate-700 hover:bg-slate-50">
                Register First Truck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="group border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/50 bg-white rounded-3xl overflow-hidden transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-primary-50 transition-colors duration-300">
                      <Truck className="w-6 h-6 text-slate-600 group-hover:text-primary-600 transition-colors duration-300" />
                    </div>
                    <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-semibold text-[10px] tracking-wider uppercase border", getStatusColor(delivery.status || 'expected'))}>
                      {(delivery.status || 'expected').replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-lg font-bold text-slate-900">{delivery.truckRegistration}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{suppliers.find(s => s.id === delivery.supplierId)?.name || 'Unknown Supplier'}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">
                        {delivery.arrivedAt ? new Date(delivery.arrivedAt).toLocaleString() : 'Not arrived'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-slate-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Expected</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{delivery.expectedQuantity} <span className="text-[10px] font-medium text-slate-400">KG</span></p>
                      </div>
                      <div className="p-3 border border-slate-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Received</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{delivery.receivedQuantity || '0'} <span className="text-[10px] font-medium text-slate-400">KG</span></p>
                      </div>
                    </div>

                    <div className="pt-2">
                      {delivery.status === "expected" && (
                        <Button
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 text-sm font-bold transition-all"
                          onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: "pending_receipt" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Check-in at Gate
                        </Button>
                      )}
                      {delivery.status === "pending_receipt" && (
                        <Button
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl h-11 text-sm font-bold transition-all shadow-lg shadow-primary-500/20"
                          onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: "weighed" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Send to Weighbridge
                        </Button>
                      )}
                      {delivery.status === "weighed" && (
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                          onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: "pending_qc" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Send to QC Lab
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
