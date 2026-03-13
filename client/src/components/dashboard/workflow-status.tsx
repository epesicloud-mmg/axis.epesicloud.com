import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ServerCog, Warehouse, Send } from "lucide-react";
import type { TruckDelivery, ProductionOrder } from "@shared/schema";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

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
    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-slate-800/60 bg-slate-900/20 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <ServerCog className="h-5 w-5 text-indigo-400" />
          </div>
          <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">Active Pipeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          {/* Delivery Step */}
          {recentDelivery && (
            <div className="flex items-center space-x-4 p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl group hover:border-emerald-500/30 transition-all">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                  Intake & Quality Control
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Truck {recentDelivery.truckRegistration} • {recentDelivery.expectedQuantity}kg
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black border-none px-2 py-0">
                    COMPLETED
                  </Badge>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {recentDelivery.arrivedAt ? format(new Date(recentDelivery.arrivedAt), "HH:mm") : '--:--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Production Step */}
          <div className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all ${activeProduction ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/20 border-slate-800/60 opacity-50'}`}>
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${activeProduction ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-slate-800 border-slate-700'}`}>
                <ServerCog className={`h-6 w-6 ${activeProduction ? 'text-indigo-400' : 'text-slate-600'}`} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-wide ${activeProduction ? 'text-white' : 'text-slate-500'}`}>Production Core</h4>
              {activeProduction ? (
                <>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeProduction.orderNumber} • {(activeProduction.productId || 'N/A')}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                      <span>Processing</span>
                      <span>{Math.min((Number(activeProduction.actualQuantityProduced || 0) / Number(activeProduction.targetQuantity)) * 100, 100).toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={Math.min((Number(activeProduction.actualQuantityProduced || 0) / Number(activeProduction.targetQuantity)) * 100, 100)}
                      className="h-1.5 bg-indigo-500/10"
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-600 mt-0.5">System standby</p>
              )}
            </div>
          </div>

          {/* Warehouse/Dispatch Steps reduced for space */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-900/20 border border-slate-800/60 rounded-2xl opacity-50">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                <Warehouse className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Vault</div>
                <div className="text-[10px] font-black text-slate-600">IDLE</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-900/20 border border-slate-800/60 rounded-2xl opacity-50">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                <Send className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Fleet</div>
                <div className="text-[10px] font-black text-slate-600">READY</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
