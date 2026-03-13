import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Package2, History } from "lucide-react";

const MOVEMENT_ICONS: Record<string, any> = {
    inbound_receipt: ArrowDownCircle,
    issue_to_production: ArrowUpCircle,
    finished_goods_receipt: ArrowDownCircle,
    dispatch_out: ArrowUpCircle,
    stock_transfer: ArrowLeftRight,
    stock_adjustment: Package2,
    reservation: Package2,
    reservation_release: Package2,
};

const MOVEMENT_COLORS: Record<string, string> = {
    inbound_receipt: "text-emerald-600 bg-emerald-50",
    issue_to_production: "text-amber-600 bg-amber-50",
    finished_goods_receipt: "text-indigo-600 bg-indigo-50",
    dispatch_out: "text-rose-600 bg-rose-50",
    stock_transfer: "text-blue-600 bg-blue-50",
    stock_adjustment: "text-slate-600 bg-slate-100",
};

const BADGE_COLORS: Record<string, string> = {
    inbound_receipt: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    issue_to_production: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    finished_goods_receipt: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    dispatch_out: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    stock_transfer: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    stock_adjustment: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export default function StockMovements() {
    const { data: movements = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/stock-movements"],
        retry: false,
    });

    const { data: products = [] } = useQuery<any[]>({
        queryKey: ["/api/products"],
        retry: false,
    });

    const getProductName = (productId: string) =>
        products.find((p: any) => p.id === productId)?.name || "Unknown Product";

    const formatType = (type: string) =>
        type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    const summary = [
        { label: "Inbound", count: movements.filter((m: any) => m.movementType === "inbound_receipt").length, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Issues", count: movements.filter((m: any) => m.movementType === "issue_to_production").length, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "FG Receipt", count: movements.filter((m: any) => m.movementType === "finished_goods_receipt").length, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Dispatched", count: movements.filter((m: any) => m.movementType === "dispatch_out").length, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movements</h1>
                <p className="text-slate-500 mt-1">Complete audit trail of all inventory movements across the facility.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {summary.map((s) => (
                    <Card key={s.label} className="border-none shadow-sm bg-white rounded-3xl">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{s.count}</p>
                            </div>
                            <div className={cn("p-3 rounded-2xl", s.bg)}>
                                <History className={cn("w-5 h-5", s.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Movements Table */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
            ) : movements.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-white/50 rounded-3xl">
                    <CardContent className="p-20 text-center">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <History className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No movements recorded yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Stock movements will appear here as deliveries are received, materials issued to production, and goods dispatched.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-5">
                        <CardTitle className="text-base font-bold text-slate-900">
                            Movement History <span className="text-slate-400 font-normal text-sm ml-2">({movements.length} records)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {movements.map((mv: any) => {
                                const Icon = MOVEMENT_ICONS[mv.movementType] || Package2;
                                const iconClass = MOVEMENT_COLORS[mv.movementType] || "text-slate-600 bg-slate-100";
                                const badgeClass = BADGE_COLORS[mv.movementType] || "bg-slate-500/10 text-slate-600 border-slate-500/20";
                                return (
                                    <div key={mv.id} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2.5 rounded-xl", iconClass.split(" ")[1])}>
                                                <Icon className={cn("w-4 h-4", iconClass.split(" ")[0])} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 text-sm">{mv.movementNumber}</p>
                                                    <Badge variant="outline" className={cn("px-2 py-0.5 rounded-full font-bold text-[9px] tracking-wider uppercase border", badgeClass)}>
                                                        {formatType(mv.movementType)}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {getProductName(mv.productId)} · <span className="font-semibold text-slate-600">{mv.quantity} KG</span>
                                                    {mv.referenceType && <> · Ref: {mv.referenceType} {mv.referenceId?.slice(0, 8)}</>}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {new Date(mv.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
