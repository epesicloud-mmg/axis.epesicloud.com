import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ServerCog, Warehouse, Send } from "lucide-react";
import type { TruckDelivery, ProductionOrder } from "@shared/schema";

export default function WorkflowStatus() {
  const { data: deliveries = [] } = useQuery<TruckDelivery[]>({
    queryKey: ["/api/deliveries"],
    retry: false,
  });

  const { data: productionOrders = [] } = useQuery<ProductionOrder[]>({
    queryKey: ["/api/production-orders"],
    retry: false,
  });

  // Get recent workflow items
  const recentDelivery = deliveries[0];
  const activeProduction = productionOrders.find((order) => order.status === "in_progress");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Workflow Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Delivery Step */}
          {recentDelivery && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Maize Delivery & Quality Check
                </h4>
                <p className="text-sm text-gray-600">
                  Truck {recentDelivery.truckRegistration} - {recentDelivery.expectedQuantity}kg
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    {(recentDelivery.status || 'pending').replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {recentDelivery.deliveryDate ? new Date(recentDelivery.deliveryDate).toLocaleString() : 'No date'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Production Step */}
          {activeProduction ? (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-primary-500">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <ServerCog className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Production Processing</h4>
                <p className="text-sm text-gray-600">
                  {activeProduction.orderNumber} - {activeProduction.productType.replace('_', ' ')}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-blue-100 text-blue-800">IN PROGRESS</Badge>
                  <span className="text-xs text-gray-500">
                    Started {activeProduction.startedAt ? new Date(activeProduction.startedAt).toLocaleString() : 
                             activeProduction.createdAt ? new Date(activeProduction.createdAt).toLocaleString() : 'No date'}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(((activeProduction.completedQuantity || 0) / activeProduction.targetQuantity) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.min(((activeProduction.completedQuantity || 0) / activeProduction.targetQuantity) * 100, 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <ServerCog className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Production Processing</h4>
                <p className="text-sm text-gray-600">No active production orders</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-gray-100 text-gray-800">IDLE</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Warehouse Step */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Warehouse Storage</h4>
              <p className="text-sm text-gray-600">Finished products ready for dispatch</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-gray-100 text-gray-800">READY</Badge>
              </div>
            </div>
          </div>

          {/* Dispatch Step */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <Send className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Dispatch & Delivery</h4>
              <p className="text-sm text-gray-600">Scheduled for customer delivery</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-gray-100 text-gray-800">SCHEDULED</Badge>
                <span className="text-xs text-gray-500">Next: Tomorrow 9:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
