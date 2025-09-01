import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
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
      return await apiRequest('/api/seed-demo-data', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Demo Data Created",
        description: "Successfully created demo data for all modules",
      });
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Demo Data",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 font-sans">
      <TopNavigation />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Production Dashboard</h2>
              <p className="text-gray-600">Monitor and manage your maize flour production workflow</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">New Delivery</span>
                  </Button>
                  <Button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <ClipboardCheck className="w-4 h-4" />
                    <span className="font-medium">Quality Check</span>
                  </Button>
                  <Button className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                    <Play className="w-4 h-4" />
                    <span className="font-medium">Start Production</span>
                  </Button>
                  <Button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <Send className="w-4 h-4" />
                    <span className="font-medium">Schedule Dispatch</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Data Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Demo Data</h3>
                    <p className="text-blue-700 text-sm">Create sample data to test all system modules and workflows</p>
                  </div>
                  <Button 
                    onClick={() => seedDemoData.mutate()}
                    disabled={seedDemoData.isPending}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Database className="w-4 h-4" />
                    <span className="font-medium">
                      {seedDemoData.isPending ? "Creating..." : "Create Demo Data"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <MetricsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Production Workflow Status */}
              <div className="lg:col-span-2 space-y-6">
                <WorkflowStatus />
                <RecentDeliveries />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <QualityAlerts />
                <ProductionOrders />
                <InventorySummary />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
