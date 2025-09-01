import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import DeliveryForm from "@/components/forms/delivery-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Truck, Calendar } from "lucide-react";
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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "quality_check":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Delivery Tracking</h2>
                <p className="text-gray-600">Track and manage truck deliveries and supplier information</p>
              </div>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Register New Delivery</DialogTitle>
                  </DialogHeader>
                  <DeliveryForm
                    suppliers={suppliers}
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
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading deliveries...</p>
              </div>
            ) : deliveries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
                  <p className="text-gray-600 mb-6">Start by registering your first truck delivery</p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Delivery
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {deliveries.map((delivery) => (
                  <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-5 h-5 text-gray-400" />
                          <CardTitle className="text-lg">{delivery.truckRegistration}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(delivery.status || 'pending')}>
                          {(delivery.status || 'pending').replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleString() : 'No date'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Expected Quantity</p>
                          <p className="font-medium">{delivery.expectedQuantity} kg</p>
                        </div>
                        {delivery.actualQuantity && (
                          <div>
                            <p className="text-sm text-gray-600">Actual Quantity</p>
                            <p className="font-medium">{delivery.actualQuantity} kg</p>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex space-x-2">
                            {delivery.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: delivery.id,
                                    status: "quality_check",
                                  })
                                }
                                disabled={updateStatusMutation.isPending}
                              >
                                Start Quality Check
                              </Button>
                            )}
                            {delivery.status === "quality_check" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: delivery.id,
                                      status: "approved",
                                    })
                                  }
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: delivery.id,
                                      status: "rejected",
                                    })
                                  }
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Reject
                                </Button>
                              </>
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
