import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Award, Clock, Package } from "lucide-react";

type DashboardMetrics = {
  dailyProduction: number;
  qualityScore: number;
  pendingOrders: number;
  inventoryLevel: number;
};

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800 rounded-3xl h-32 animate-pulse">
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Daily Production",
      value: `${(metrics?.dailyProduction || 0).toLocaleString()} kg`,
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      label: "Quality Score",
      value: `${(metrics?.qualityScore || 0).toFixed(1)}%`,
      change: "Above Target",
      icon: Award,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      label: "Pending Orders",
      value: metrics?.pendingOrders || 0,
      change: "3 Critical",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      label: "Inventory Level",
      value: `${(metrics?.inventoryLevel || 0).toFixed(0)}%`,
      change: "Optimal",
      icon: Package,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card key={i} className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl border-l-4 transition-all hover:scale-[1.02] hover:bg-slate-900/60" style={{ borderLeftColor: `rgb(var(--${card.color.split('-')[1]}-500))` }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{card.label}</p>
                <p className="text-3xl font-black text-white leading-none tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center border ${card.border} shadow-lg shadow-black/20`}>
                <card.icon className={`h-7 w-7 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
