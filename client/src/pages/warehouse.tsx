import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Warehouse as WarehouseIcon, Package, AlertTriangle } from "lucide-react";
import type { RawMaterialBatch, FinishedProductBatch, Product, StorageLocation } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StockLevel {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  locationId: string;
  locationName: string;
  zone: string;
  itemType: "raw_material" | "finished_product";
  currentQuantity: string;
  reservedQuantity: string;
  blockedQuantity: string;
  unit: string;
}

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

  const { data: stockBalances = [], isLoading: balancesLoading } = useQuery<StockLevel[]>({
    queryKey: ["/api/inventory/balances"],
    retry: false,
  });

  const { data: storageLocations = [] } = useQuery<any[]>({
    queryKey: ["/api/master-data/storage-locations"],
    retry: false,
  });

  const getStockLevelColor = (currentQty: number, minThreshold: number = 100) => {
    if (currentQty <= minThreshold) {
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    } else if (currentQty <= minThreshold * 2) {
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Synchronizing Inventory...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Warehouse & Logistics</h1>
          <p className="text-slate-500 mt-1">Real-time inventory visibility and multi-location management.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl px-6 h-12 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold">
            <WarehouseIcon className="w-4 h-4 mr-2" />
            Manage Locations
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-12 shadow-lg shadow-slate-900/10 transition-all font-bold">
            <Package className="w-4 h-4 mr-2" />
            Transfer Stock
          </Button>
        </div>
      </div>

      {/* Warehouse Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-2xl">
                <WarehouseIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Capacity</p>
                <p className="text-2xl font-black text-slate-900">84% Utilized</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-500/10 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
                <p className="text-2xl font-black text-slate-900">3 SKUs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 rounded-2xl">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Movements</p>
                <p className="text-2xl font-black text-slate-900">12 Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-900">Product / Batch</TableHead>
                <TableHead className="font-bold text-slate-900">Warehouse Location</TableHead>
                <TableHead className="font-bold text-slate-900">Current Balance</TableHead>
                <TableHead className="font-bold text-slate-900">Allocated</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balancesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="h-16 bg-slate-50/50"></TableCell>
                  </TableRow>
                ))
              ) : stockBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-medium">
                    No inventory records found in the system.
                  </TableCell>
                </TableRow>
              ) : (
                stockBalances.map((stock) => (
                  <TableRow key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{stock.productName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1.5 tracking-tighter">
                          Batch: {stock.batchId || "UNBATCHED"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg border-slate-200 bg-slate-50 text-slate-600 font-bold px-3">
                        {stock.locationName}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-slate-900 text-lg">
                      {stock.currentQuantity} {stock.unit || "KG"}
                    </TableCell>
                    <TableCell className="font-bold text-amber-600">
                      {stock.reservedQuantity} {stock.unit || "KG"}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-lg border-none", getStockLevelColor(parseFloat(stock.currentQuantity)))}>
                        {parseFloat(stock.currentQuantity) <= 200 ? "LOW STOCK" : "OPTIMAL"}
                      </Badge>
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
