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
import { Plus, ServerCog, Calendar, Target } from "lucide-react";
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

  const { data: productionOrders = [], isLoading: ordersLoading } = useQuery<ProductionOrder[]>({
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
        title: "Success",
        description: "Production order status updated successfully",
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
        description: "Failed to update production order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (completed: number, target: number) => {
    return Math.min((completed / target) * 100, 100);
  };

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Production Orders</h2>
                <p className="text-gray-600">Plan, schedule and monitor production activities</p>
              </div>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Production Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Production Order</DialogTitle>
                  </DialogHeader>
                  <ProductionOrderForm
                    onSuccess={() => {
                      setShowForm(false);
                      queryClient.invalidateQueries({ queryKey: ["/api/production-orders"] });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Production Orders Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{productionOrders.length}</p>
                    </div>
                    <ServerCog className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {productionOrders.filter((order: any) => order.status === "in_progress").length}
                      </p>
                    </div>
                    <ServerCog className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {productionOrders.filter((order: any) => order.status === "completed").length}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {productionOrders.filter((order: any) => order.status === "scheduled").length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Production Orders List */}
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading production orders...</p>
              </div>
            ) : productionOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ServerCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No production orders found</h3>
                  <p className="text-gray-600 mb-6">Start by creating your first production order</p>
                  <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Production Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {productionOrders.map((order: any) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ServerCog className="w-5 h-5 text-gray-400" />
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Product Type</p>
                          <p className="font-medium">{order.productType.replace('_', ' ')}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Target Quantity</p>
                            <p className="font-medium">{order.targetQuantity} units</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="font-medium">{order.completedQuantity} units</p>
                          </div>
                        </div>

                        {order.status === "in_progress" && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">
                                {calculateProgress(order.completedQuantity, order.targetQuantity).toFixed(1)}%
                              </span>
                            </div>
                            <Progress 
                              value={calculateProgress(order.completedQuantity, order.targetQuantity)} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {order.scheduledDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex space-x-2">
                            {order.status === "scheduled" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: "in_progress",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Start Production
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: "completed",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
