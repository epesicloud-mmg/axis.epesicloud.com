import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Send, Calendar, MapPin, Truck } from "lucide-react";
import type { DispatchOrder } from "@shared/schema";

interface DispatchFormData {
  orderNumber: string;
  customerName: string;
  customerId: string;
  deliveryAddress: string;
  scheduledDate: string;
  receiverName: string;
}

export default function Dispatch() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const { data: dispatchOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/dispatch-orders"],
    retry: false,
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/master-data/customers"],
    retry: false,
  });

  const form = useForm<DispatchFormData>();

  const createDispatchMutation = useMutation({
    mutationFn: async (data: DispatchFormData) => {
      await apiRequest("POST", "/api/dispatch-orders", {
        ...data,
        status: "scheduled",
        createdBy: user?.id,
        // Ensure we send numeric values if schema expects them, though schema usually handles strings/dates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-orders"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Order Scheduled",
        description: "Dispatch logistics have been initialized.",
      });
    },
    onError: (error) => {
      toast({
        title: "Dispatch Error",
        description: "Failed to initialize dispatch order.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/dispatch-orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-orders"] });
      toast({
        title: "Logistics Sync",
        description: "Delivery state updated in real-time.",
      });
    },
    onError: (error) => {
      toast({
        title: "System Error",
        description: "Could not synchronize delivery state.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "dispatched": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "loading": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "scheduled": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "allocated": return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case "cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const onSubmit = (data: DispatchFormData) => {
    createDispatchMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Synchronizing Fleet...</p>
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">External Logistics</h1>
            <p className="text-slate-500 mt-1">Manage outbound fulfillment, vehicle loading, and POD tracking.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-12 shadow-lg shadow-slate-900/10 transition-all font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Plan Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">Shipment Initialization</DialogTitle>
                  <p className="text-slate-400 text-sm">Define destination and scheduling for new delivery.</p>
                </DialogHeader>
              </div>
              <div className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber" className="text-xs font-bold text-slate-500 uppercase">Dispatch ID</Label>
                      <Input
                        id="orderNumber"
                        {...form.register("orderNumber", { required: true })}
                        className="rounded-xl border-slate-200 h-11"
                        placeholder="e.g. DIS-1002"
                        defaultValue={`DIS-${Date.now().toString().slice(-4)}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerId" className="text-xs font-bold text-slate-500 uppercase">Corporate Customer</Label>
                      <Select onValueChange={(v) => form.setValue("customerId", v)}>
                        <SelectTrigger className="rounded-xl border-slate-200 h-11">
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {customers.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="text-xs font-bold text-slate-500 uppercase">Destination Logistics</Label>
                    <Textarea
                      id="deliveryAddress"
                      {...form.register("deliveryAddress", { required: true })}
                      placeholder="Detailed drop-off coordinates..."
                      className="rounded-xl border-slate-200 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate" className="text-xs font-bold text-slate-500 uppercase">Loading Schedule</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        {...form.register("scheduledDate", { required: true })}
                        className="rounded-xl border-slate-200 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiverName" className="text-xs font-bold text-slate-500 uppercase">On-Site Receiver</Label>
                      <Input
                        id="receiverName"
                        {...form.register("receiverName")}
                        placeholder="Full Name"
                        className="rounded-xl border-slate-200 h-11"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={createDispatchMutation.isPending}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold shadow-lg"
                    >
                      {createDispatchMutation.isPending ? "Validating..." : "Confirm Shipment Plan"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="rounded-xl h-12 px-6 border-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Global Logistics Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Orders", value: dispatchOrders.length, icon: Send, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Awaiting Load", value: dispatchOrders.filter(o => o.status === 'scheduled').length, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Transiting", value: dispatchOrders.filter(o => o.status === 'dispatched').length, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Fulfillment Rate", value: "94.8%", icon: Send, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white rounded-3xl font-sans">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Cards */}
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto"></div>
            <p className="text-slate-400 font-medium">Fetching active logistics chain...</p>
          </div>
        ) : dispatchOrders.length === 0 ? (
          <Card className="border-none shadow-sm bg-white rounded-[40px] p-12 text-center">
            <Send className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900">Logistics Queue Empty</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">No shipments are currently scheduled for fulfillment.</p>
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 text-white rounded-xl px-8 h-12 font-bold">
              Schedule Now
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dispatchOrders.map((order: any) => (
              <Card key={order.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xs group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {order.orderNumber.slice(-2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.customerName}</p>
                      </div>
                    </div>
                    <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] border shadow-sm", getStatusColor(order.status))}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Routing Hub</p>
                        <p className="text-sm font-medium text-slate-700 mt-1">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {new Date(order.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Handover Status</p>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {order.dispatchedAt ? 'IN TRANSIT' : 'READY FOR BAY'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Send className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Receiver: {order.receiverName || 'System Allocated'}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "scheduled" && (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "loading" })}
                        >
                          Confirm Bay 1 Loading
                        </Button>
                      )}
                      {order.status === "loading" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "dispatched" })}
                        >
                          Release Vehicle
                        </Button>
                      )}
                      {order.status === "dispatched" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                          onClick={() => updateStatusMutation.mutate({ id: order.id, status: "delivered" })}
                        >
                          Confirm Landing / POD
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
