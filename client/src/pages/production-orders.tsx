import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import ProductionOrderForm from "@/components/forms/production-order-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ServerCog, Calendar, Target, Box, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Active Loads", value: productionOrders.filter(o => o.status === 'in_progress').length, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Daily Yield", value: "98.2%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Scheduled", value: productionOrders.filter(o => o.status === 'scheduled').length, icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-900 py-4 h-14">Order Reference</TableHead>
                <TableHead className="font-bold text-slate-900">Output Target</TableHead>
                <TableHead className="font-bold text-slate-900">Current Yield</TableHead>
                <TableHead className="font-bold text-slate-900">Lifecycle State</TableHead>
                <TableHead className="text-right font-bold text-slate-900 pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="h-20 bg-slate-50/50"></TableCell>
                  </TableRow>
                ))
              ) : productionOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <ServerCog className="w-16 h-16" />
                      <p className="font-bold">No active manufacturing cycles</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productionOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/30 transition-colors">
                    <TableCell className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl">
                          <Box className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{order.orderNumber}</p>
                          <p className="text-xs text-slate-400 mt-1.5 font-medium">Started {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">{order.targetQuantity} KG</TableCell>
                    <TableCell>
                      <div className="w-full max-w-[140px] space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Progress</span>
                          <span>{Math.round((order.actualQuantityProduced / order.targetQuantity) * 100)}%</span>
                        </div>
                        <Progress value={(order.actualQuantityProduced / order.targetQuantity) * 100} className="h-1.5 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-lg border-none px-3 py-1 font-bold text-[10px] tracking-wider uppercase", getStatusColor(order.status))}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button variant="ghost" className="rounded-xl font-bold text-slate-600 hover:bg-slate-100">Synchronize</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
