import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ProductionOrder } from "@shared/schema";

export default function ProductionOrders() {
  const { data: productionOrders = [], isLoading } = useQuery<ProductionOrder[]>({
    queryKey: ["/api/production-orders"],
    retry: false,
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeOrders = productionOrders
    .filter((order) => order.status === "in_progress" || order.status === "scheduled")
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Production Orders</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">No active production orders</p>
            <p className="text-xs text-gray-500 mt-1">Create a new production order to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order: any) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{order.orderNumber}</h4>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {order.productType.replace('_', ' ')}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target:</span>
                    <span className="text-gray-900">{order.targetQuantity} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completed:</span>
                    <span className="text-gray-900">{order.completedQuantity} units</span>
                  </div>
                  {order.status === "in_progress" && (
                    <div className="w-full">
                      <Progress 
                        value={Math.min((order.completedQuantity / order.targetQuantity) * 100, 100)}
                        className="h-2"
                      />
                    </div>
                  )}
                  {order.status === "scheduled" && order.scheduledDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Start Date:</span>
                      <span className="text-gray-900">
                        {new Date(order.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
