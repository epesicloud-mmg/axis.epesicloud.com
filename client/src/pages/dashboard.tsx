import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import MetricsCards from "@/components/dashboard/metrics-cards";
import WorkflowStatus from "@/components/dashboard/workflow-status";
import RecentDeliveries from "@/components/dashboard/recent-deliveries";
import QualityAlerts from "@/components/dashboard/quality-alerts";
import ProductionOrders from "@/components/dashboard/production-orders";
import InventorySummary from "@/components/dashboard/inventory-summary";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardCheck, Play, Send, Database } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Demo data seeding mutation
  const seedDemoData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/seed-demo-data');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demo Data Synchronized",
        description: "Successfully populated the ecosystem with sample data.",
      });
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Provisioning Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <div className="text-slate-500 font-bold tracking-widest uppercase text-xs">Initializing Core...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-[#0a0b14] min-h-screen text-slate-200">
      <div className="max-w-[1600px] mx-auto p-8 space-y-8">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">
              Operational <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-8">Intelligence</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg">Real-time telemetry and workflow control center</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => seedDemoData.mutate()}
              disabled={seedDemoData.isPending}
              className="h-14 px-8 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-3xl font-bold flex items-center gap-3 transition-all hover:scale-105"
            >
              <Database className="h-5 w-5" />
              {seedDemoData.isPending ? "PROVISIONING..." : "SEED DEMO ECOSYSTEM"}
            </Button>
          </div>
        </header>

        {/* Key Metrics */}
        <MetricsCards />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Intelligence Loop */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 rounded-3xl group transition-all">
                <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Inbound</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 rounded-3xl group transition-all">
                <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quality Check</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-900/40 border border-slate-800 hover:border-amber-500/50 rounded-3xl group transition-all">
                <div className="p-2 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Production</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-900/40 border border-slate-800 hover:border-rose-500/50 rounded-3xl group transition-all">
                <div className="p-2 bg-rose-500/10 rounded-xl group-hover:scale-110 transition-transform">
                  <Send className="h-5 w-5 text-rose-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch</span>
              </Button>
            </div>

            <WorkflowStatus />
            <RecentDeliveries />
          </div>

          {/* Side Telemetry */}
          <div className="lg:col-span-4 space-y-8">
            <QualityAlerts />
            <ProductionOrders />
            <InventorySummary />
          </div>
        </div>
      </div>
    </div>
  );
}
