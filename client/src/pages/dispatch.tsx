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
import { Plus, Send, Calendar, MapPin, Truck } from "lucide-react";
import type { DispatchOrder } from "@shared/schema";

interface DispatchFormData {
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  scheduledDate: string;
}

export default function Dispatch() {
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

  const { data: dispatchOrders = [], isLoading: ordersLoading } = useQuery<DispatchOrder[]>({
    queryKey: ["/api/dispatch-orders"],
    retry: false,
  });

  const form = useForm<DispatchFormData>();

  const createDispatchMutation = useMutation({
    mutationFn: async (data: DispatchFormData) => {
      await apiRequest("POST", "/api/dispatch-orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dispatch-orders"] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Dispatch order created successfully",
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
        description: "Failed to create dispatch order",
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
        title: "Success",
        description: "Dispatch order status updated successfully",
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
        description: "Failed to update dispatch order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "dispatched":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onSubmit = (data: DispatchFormData) => {
    createDispatchMutation.mutate(data);
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
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Dispatch Management</h2>
                <p className="text-gray-600">Schedule and track product deliveries to customers</p>
              </div>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-600 hover:bg-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Dispatch
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Dispatch</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="orderNumber">Order Number</Label>
                      <Input
                        id="orderNumber"
                        {...form.register("orderNumber", { required: true })}
                        placeholder="e.g., DO-2024-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        {...form.register("customerName", { required: true })}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryAddress">Delivery Address</Label>
                      <Textarea
                        id="deliveryAddress"
                        {...form.register("deliveryAddress", { required: true })}
                        placeholder="Full delivery address"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledDate">Scheduled Date</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        {...form.register("scheduledDate", { required: true })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={createDispatchMutation.isPending}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        {createDispatchMutation.isPending ? "Creating..." : "Create Dispatch Order"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Dispatch Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{dispatchOrders.length}</p>
                    </div>
                    <Send className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {dispatchOrders.filter((order: any) => order.status === "scheduled").length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dispatched</p>
                      <p className="text-2xl font-semibold text-blue-600">
                        {dispatchOrders.filter((order: any) => order.status === "dispatched").length}
                      </p>
                    </div>
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivered</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {dispatchOrders.filter((order: any) => order.status === "delivered").length}
                      </p>
                    </div>
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch Orders List */}
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dispatch orders...</p>
              </div>
            ) : dispatchOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No dispatch orders found</h3>
                  <p className="text-gray-600 mb-6">Start by scheduling your first dispatch</p>
                  <Button onClick={() => setShowForm(true)} className="bg-gray-600 hover:bg-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Dispatch
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dispatchOrders.map((order: any) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Send className="w-5 h-5 text-gray-400" />
                          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium">{order.customerName}</p>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Delivery Address</p>
                            <p className="text-sm">{order.deliveryAddress}</p>
                          </div>
                        </div>

                        {order.scheduledDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Scheduled</p>
                              <p className="text-sm font-medium">
                                {new Date(order.scheduledDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {order.dispatchedAt && (
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Dispatched</p>
                              <p className="text-sm font-medium">
                                {new Date(order.dispatchedAt).toLocaleString()}
                              </p>
                            </div>
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
                                    status: "dispatched",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Dispatched
                              </Button>
                            )}
                            {order.status === "dispatched" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: "delivered",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Delivered
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
