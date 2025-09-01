import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon, Package, AlertTriangle } from "lucide-react";
import type { WarehouseStock, RawMaterialBatch, FinishedProductBatch } from "@shared/schema";

export default function Warehouse() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: warehouseStock = [], isLoading: stockLoading } = useQuery<WarehouseStock[]>({
    queryKey: ["/api/warehouse/stock"],
    retry: false,
  });

  const { data: rawBatches = [] } = useQuery<RawMaterialBatch[]>({
    queryKey: ["/api/raw-material-batches"],
    retry: false,
  });

  const { data: finishedBatches = [] } = useQuery<FinishedProductBatch[]>({
    queryKey: ["/api/finished-product-batches"],
    retry: false,
  });

  const getStockLevelColor = (currentQty: number, minThreshold: number = 100) => {
    if (currentQty <= minThreshold) {
      return "bg-red-100 text-red-800";
    } else if (currentQty <= minThreshold * 2) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-green-100 text-green-800";
  };

  const getStockLevelText = (currentQty: number, minThreshold: number = 100) => {
    if (currentQty <= minThreshold) {
      return "Low Stock";
    } else if (currentQty <= minThreshold * 2) {
      return "Medium Stock";
    }
    return "Stock OK";
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
            <div className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Warehouse Management</h2>
              <p className="text-gray-600">Monitor inventory levels and manage stock movements</p>
            </div>

            {/* Warehouse Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Raw Materials</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {rawBatches.filter((batch: any) => batch.qualityStatus === "passed").length}
                      </p>
                      <p className="text-sm text-gray-500">batches available</p>
                    </div>
                    <WarehouseIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Finished Products</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {finishedBatches.reduce((total: number, batch: any) => total + (batch.quantity || 0), 0)}
                      </p>
                      <p className="text-sm text-gray-500">units in stock</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                      <p className="text-2xl font-semibold text-red-600">
                        {warehouseStock.filter((item: any) => parseFloat(item.currentQuantity) <= 100).length}
                      </p>
                      <p className="text-sm text-gray-500">require attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Raw Materials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <WarehouseIcon className="w-5 h-5 text-yellow-600" />
                    <span>Raw Materials Inventory</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rawBatches.length === 0 ? (
                    <div className="text-center py-8">
                      <WarehouseIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No raw material batches found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rawBatches
                        .filter((batch: any) => batch.qualityStatus === "passed")
                        .map((batch: any) => (
                          <div
                            key={batch.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{batch.batchNumber}</h4>
                              <p className="text-sm text-gray-600">
                                Quantity: {batch.quantity} kg
                              </p>
                              {batch.storageLocation && (
                                <p className="text-sm text-gray-500">
                                  Location: {batch.storageLocation}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-800">
                                Quality Passed
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Finished Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Finished Products Inventory</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {finishedBatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No finished products found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {finishedBatches.map((batch: any) => (
                        <div
                          key={batch.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{batch.batchNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {batch.productType.replace('_', ' ')} - {batch.packageSize}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {batch.quantity} units
                            </p>
                            {batch.storageLocation && (
                              <p className="text-sm text-gray-500">
                                Location: {batch.storageLocation}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={getStockLevelColor(batch.quantity || 0, 50)}
                            >
                              {getStockLevelText(batch.quantity || 0, 50)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Stock Levels */}
            {warehouseStock.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Stock Level Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {warehouseStock.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            {item.itemType === "raw_maize" ? (
                              <WarehouseIcon className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Package className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.itemType.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-gray-600">Location: {item.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {parseFloat(item.currentQuantity).toFixed(0)} 
                              {item.itemType === "raw_maize" ? " kg" : " units"}
                            </p>
                            {item.reservedQuantity > 0 && (
                              <p className="text-sm text-gray-500">
                                Reserved: {parseFloat(item.reservedQuantity).toFixed(0)}
                              </p>
                            )}
                          </div>
                          <Badge className={getStockLevelColor(parseFloat(item.currentQuantity))}>
                            {getStockLevelText(parseFloat(item.currentQuantity))}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
