import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    CheckCircle2,
    Package,
    ArrowRight,
    Database,
    History,
    AlertTriangle,
    ClipboardList
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductionOrder {
    id: string;
    orderNumber: string;
    targetQuantity: string;
    actualQuantityProduced: string;
    totalQuantityIssued: string;
    status: string;
    productId: string;
    createdAt: string;
}

interface RawBatch {
    id: string;
    batchNumber: string;
}

interface Location {
    id: string;
    name: string;
}

export default function ProductionWorkOrders() {
    const { toast } = useToast();
    const { user } = useAuth();

    const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
    const [issueData, setIssueData] = useState({ rawBatchId: '', quantity: '', locationId: '' });
    const [outputData, setOutputData] = useState({ quantity: '', packageSize: '2kg', locationId: '' });

    const { data: orders = [], isLoading } = useQuery<ProductionOrder[]>({
        queryKey: ["/api/production/orders"],
    });

    const { data: rawBatches = [] } = useQuery<RawBatch[]>({
        queryKey: ["/api/raw-material-batches"],
    });

    const { data: products = [] } = useQuery<any[]>({
        queryKey: ["/api/products"],
    });

    const { data: locations = [] } = useQuery<Location[]>({
        queryKey: ["/api/locations"],
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await fetch(`/api/production/orders/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/production/orders"] });
            toast({ title: "Order Updated", description: "Status changed successfully." });
        }
    });

    const issueMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/production/issue-materials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to issue materials");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/production/orders"] });
            queryClient.invalidateQueries({ queryKey: ["/api/inventory/balances"] });
            toast({ title: "Materials Issued", description: "Stock balance updated." });
        }
    });

    const outputMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/production/record-output", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to record output");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/production/orders"] });
            toast({ title: "Output Recorded", description: "Finished goods batch created." });
        }
    });

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, string> = {
            'released': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'in_progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse',
            'completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest border", statuses[status] || "bg-slate-800 text-slate-500");
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-primary-500" />
                            Production Floor Control
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Active work orders, material consumption, and output recording.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {orders.filter(o => ['released', 'in_progress'].includes(o.status)).map((order) => (
                        <Card key={order.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl transition-all hover:bg-slate-800/80">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-4">
                                            <Badge className={getStatusBadge(order.status)}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                            <span className="text-xs font-black text-slate-500 tracking-widest">{order.orderNumber}</span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight">
                                                {products.find(p => p.id === order.productId)?.name || "Maize Flour Production"}
                                            </h3>
                                            <p className="text-slate-400 text-sm font-medium mt-1">Target: {order.targetQuantity}kg</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Issued Material</p>
                                                <p className="text-xl font-black text-blue-400">{order.totalQuantityIssued}kg</p>
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recorded Output</p>
                                                <p className="text-xl font-black text-emerald-400">{order.actualQuantityProduced}kg</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[240px]">
                                        {order.status === 'released' ? (
                                            <Button
                                                onClick={() => statusMutation.mutate({ id: order.id, status: 'in_progress' })}
                                                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-14 font-black text-sm tracking-widest transition-all hover:scale-105"
                                            >
                                                <Play className="w-5 h-5 mr-3 fill-current" />
                                                START BATCH
                                            </Button>
                                        ) : (
                                            <>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-2xl h-14 font-black text-sm tracking-widest transition-all">
                                                            <Database className="w-5 h-5 mr-3" />
                                                            ISSUE RAW MATERIAL
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl p-8 max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl font-black tracking-tight">Material Issue</DialogTitle>
                                                            <DialogDescription className="text-slate-400">Deduct raw material from warehouse stock and issue to batch.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 py-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Source Batch</Label>
                                                                <Select onValueChange={(v) => setIssueData({ ...issueData, rawBatchId: v })}>
                                                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-12 rounded-xl focus:ring-primary-500">
                                                                        <SelectValue placeholder="Select raw material batch" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                                        {rawBatches.map(b => (
                                                                            <SelectItem key={b.id} value={b.id}>{b.batchNumber}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Quantity (kg)</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    className="bg-slate-800 border-slate-700 h-12 rounded-xl"
                                                                    onChange={(e) => setIssueData({ ...issueData, quantity: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button
                                                                onClick={() => issueMutation.mutate({
                                                                    productionOrderId: order.id,
                                                                    rawBatchId: issueData.rawBatchId,
                                                                    quantityIssued: issueData.quantity,
                                                                    issuedFromLocationId: "LOC-SILO-1", // Simplified
                                                                })}
                                                                className="w-full bg-primary-500 hover:bg-primary-600 rounded-xl h-12 font-bold"
                                                            >
                                                                Confirm Issue
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-2xl h-14 font-black text-sm tracking-widest transition-all">
                                                            <Package className="w-5 h-5 mr-3" />
                                                            RECORD OUTPUT
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl p-8 max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-2xl font-black tracking-tight">Production Output</DialogTitle>
                                                            <DialogDescription className="text-slate-400">Register finished goods produced from this work order.</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 py-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Weight (kg)</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    className="bg-slate-800 border-slate-700 h-12 rounded-xl"
                                                                    onChange={(e) => setOutputData({ ...outputData, quantity: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Storage Location</Label>
                                                                <Select onValueChange={(v) => setOutputData({ ...outputData, locationId: v })}>
                                                                    <SelectTrigger className="bg-slate-800 border-slate-700 h-12 rounded-xl">
                                                                        <SelectValue placeholder="Select silo/warehouse" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                                        <SelectItem value="LOC-FG-WH1">Finished Goods Warehouse 1</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button
                                                                onClick={() => outputMutation.mutate({
                                                                    productionOrderId: order.id,
                                                                    productId: order.productId,
                                                                    quantityProduced: outputData.quantity,
                                                                    packageSize: outputData.packageSize,
                                                                    storageLocationId: outputData.locationId,
                                                                    productionDate: new Date(),
                                                                })}
                                                                className="w-full bg-primary-500 hover:bg-primary-600 rounded-xl h-12 font-bold"
                                                            >
                                                                Commit Output
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>

                                                <Button
                                                    onClick={() => statusMutation.mutate({ id: order.id, status: 'completed' })}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black text-sm tracking-widest transition-all"
                                                >
                                                    <CheckCircle2 className="w-5 h-5 mr-3" />
                                                    COMPLETE ORDER
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {orders.filter(o => ['released', 'in_progress'].includes(o.status)).length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700/50">
                            <History className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400 tracking-tight">No Active Work Orders</h3>
                            <p className="text-slate-500 text-sm mt-1">Waiting for production manager to release new orders.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
