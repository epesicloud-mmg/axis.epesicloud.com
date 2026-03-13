import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import ProductionOrderForm from "@/components/forms/production-order-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ServerCog, Calendar, Target, Box, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductionOrder } from "@shared/schema";

export default function ProductionOrders() {
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

  const { data: productionOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/production-orders"],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/production-orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
      toast({
        title: "Status Synchronized",
        description: "Production lifecycle state has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Error",
        description: "Failed to transition production state.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "quality_check": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "scheduled": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading Production System...</p>
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Intelligence</h1>
            <p className="text-slate-500 mt-1">Monitor manufacturing throughput, yield efficiency, and order lifecycles.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-12 shadow-lg shadow-slate-900/10 transition-all font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Initialize Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">New Production Configuration</DialogTitle>
                  <p className="text-slate-400 text-sm">Define product parameters and target outputs.</p>
                </DialogHeader>
              </div>
              <div className="p-6">
                <ProductionOrderForm
                  onSuccess={() => {
                    setShowForm(false);
                    queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Orders", value: productionOrders.filter(o => o.status === 'in_progress').length, icon: ServerCog, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Pending QC", value: productionOrders.filter(o => o.status === 'quality_check').length, icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "Completed Today", value: productionOrders.filter(o => o.status === 'completed').length, icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Average Yield", value: "98.2%", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
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

        {/* Orders Listing */}
        {ordersLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-slate-400 font-medium">Fetching active floor data...</p>
          </div>
        ) : productionOrders.length === 0 ? (
          <Card className="border-none shadow-sm bg-white rounded-[40px] p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ServerCog className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Active Production</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">Ready to start the line? Configure your first work order to begin tracking.</p>
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Configure Line
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {productionOrders.map((order: any) => {
              const progress = (order.completedQuantity / order.targetQuantity) * 100;
              return (
                <Card key={order.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                          {order.orderNumber.slice(-2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.productType.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] border shadow-sm", getStatusColor(order.status))}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Target</p>
                        <p className="text-lg font-black text-slate-900 mt-1">{order.targetQuantity.toLocaleString()}<span className="text-xs font-medium text-slate-400 ml-1">UNITS</span></p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-transparent group-hover:border-slate-200 transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Actual</p>
                        <p className="text-lg font-black text-slate-900 mt-1">{order.completedQuantity.toLocaleString()}<span className="text-xs font-medium text-slate-400 ml-1">UNITS</span></p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Yield</p>
                        <p className="text-lg font-black text-emerald-600 mt-1">{order.yieldPercentage || '0'}%</p>
                      </div>
                    </div>

                    {order.status === "in_progress" && (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Throughput Progress</p>
                          <p className="text-sm font-black text-slate-900">{progress.toFixed(1)}%</p>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full bg-slate-100" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "scheduled" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "in_progress" })}
                          >
                            Init Machine
                          </Button>
                        )}
                        {order.status === "in_progress" && (
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "quality_check" })}
                          >
                            Dispatch to QC
                          </Button>
                        )}
                        {order.status === "quality_check" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-0 h-9 font-bold text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: "completed" })}
                          >
                            Release Logic
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
