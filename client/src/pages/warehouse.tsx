import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Warehouse as WarehouseIcon, Package, AlertTriangle } from "lucide-react";
import type { RawMaterialBatch, FinishedProductBatch, Product, StorageLocation } from "@shared/schema";

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
    <div className="min-h-screen bg-slate-50/50">
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
          {[
            { label: "Total Assets", value: stockBalances.length, icon: WarehouseIcon, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Monitored SKU locations" },
            { label: "Available Stock", value: stockBalances.reduce((t, s) => t + parseFloat(s.currentQuantity || "0"), 0).toLocaleString(), icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Total bulk units" },
            { label: "Critical Stock", value: stockBalances.filter((s) => parseFloat(s.currentQuantity || "0") < 100).length, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Items below threshold" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.desc}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Table/Grid */}
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Live Inventory Balance</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">Active</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item / Category</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Location</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Current Stock</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Reserved</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balancesLoading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto"></div></td></tr>
                  ) : stockBalances.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">No stock records found across locations.</td></tr>
                  ) : (
                    stockBalances.map((item) => {
                      const qty = parseFloat(item.currentQuantity || "0");
                      const reserved = parseFloat(item.reservedQuantity || "0");
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                {item.itemType === "raw_material" ? <WarehouseIcon className="w-4 h-4 text-amber-600" /> : <Package className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{item.productName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{item.batchId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <p className="text-sm font-medium text-slate-600">{item.locationName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Zone: {item.zone}</p>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <p className="text-sm font-black text-slate-900">{qty.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</p>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <p className="text-sm font-bold text-slate-500">{reserved.toLocaleString()}</p>
                          </td>
                          <td className="px-8 py-4 text-center">
                            <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] border", getStockLevelColor(qty))}>
                              {qty < 100 ? 'LOW' : 'STABLE'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
