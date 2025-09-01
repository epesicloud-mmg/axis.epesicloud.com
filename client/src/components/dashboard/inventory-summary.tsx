import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wheat, Package } from "lucide-react";
import type { RawMaterialBatch, FinishedProductBatch } from "@shared/schema";

export default function InventorySummary() {
  const { data: rawBatches = [] } = useQuery<RawMaterialBatch[]>({
    queryKey: ["/api/raw-material-batches"],
    retry: false,
  });

  const { data: finishedBatches = [] } = useQuery<FinishedProductBatch[]>({
    queryKey: ["/api/finished-product-batches"],
    retry: false,
  });

  const getStockStatus = (quantity: number, threshold: number = 100) => {
    if (quantity <= threshold) {
      return { text: "Low Stock", color: "bg-red-100 text-red-800" };
    } else if (quantity <= threshold * 2) {
      return { text: "Medium", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Stock OK", color: "bg-green-100 text-green-800" };
  };

  // Calculate totals
  const totalRawMaize = rawBatches
    .filter((batch) => batch.qualityStatus === "passed")
    .reduce((total, batch) => total + parseFloat(batch.quantity || "0"), 0);

  const totalFinishedProducts = finishedBatches
    .reduce((total, batch) => total + (batch.quantity || 0), 0);

  const inventoryItems = [
    {
      name: "Raw Maize",
      location: "Warehouse A",
      quantity: `${totalRawMaize.toFixed(0)} kg`,
      status: getStockStatus(totalRawMaize, 1000),
      icon: Wheat,
      color: "yellow"
    },
    {
      name: "Flour 2kg",
      location: "Warehouse B",
      quantity: `${finishedBatches.filter((b) => b.packageSize === "2kg").reduce((t, b) => t + (b.quantity || 0), 0)} units`,
      status: getStockStatus(finishedBatches.filter((b) => b.packageSize === "2kg").reduce((t, b) => t + (b.quantity || 0), 0), 50),
      icon: Package,
      color: "blue"
    },
    {
      name: "Flour 4kg",
      location: "Warehouse B", 
      quantity: `${finishedBatches.filter((b) => b.packageSize === "4kg").reduce((t, b) => t + (b.quantity || 0), 0)} units`,
      status: getStockStatus(finishedBatches.filter((b) => b.packageSize === "4kg").reduce((t, b) => t + (b.quantity || 0), 0), 30),
      icon: Package,
      color: "purple"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventoryItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{item.quantity}</p>
                <Badge className={item.status.color}>
                  {item.status.text}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
