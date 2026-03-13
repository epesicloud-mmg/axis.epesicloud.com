import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Plus, Layers, Package, CheckCircle, Clock } from "lucide-react";

export default function ReceivingIntake() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        deliveryId: "",
        productId: "",
        quantityReceived: "",
        initialLocationId: "",
        notes: "",
    });

    const { data: deliveries = [] } = useQuery<any[]>({
        queryKey: ["/api/deliveries"],
        retry: false,
        select: (d) => d.filter((x: any) => x.status === "received" || x.status === "pending_qc"),
    });

    const { data: products = [] } = useQuery<any[]>({
        queryKey: ["/api/products"],
        retry: false,
    });

    const { data: locations = [] } = useQuery<any[]>({
        queryKey: ["/api/locations"],
        retry: false,
    });

    const { data: rawBatches = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/raw-material-batches"],
        retry: false,
    });

    const createBatchMutation = useMutation({
        mutationFn: async (data: typeof form) => {
            const batchNumber = `RM-${Date.now()}`;
            return await apiRequest("POST", "/api/raw-material-batches", {
                ...data,
                batchNumber,
                intakeBy: user?.id,
                quantityReceived: data.quantityReceived,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/raw-material-batches"] });
            setShowForm(false);
            setForm({ deliveryId: "", productId: "", quantityReceived: "", initialLocationId: "", notes: "" });
            toast({ title: "Success", description: "Raw material batch logged successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to log batch.", variant: "destructive" });
        },
    });

    const getStatusColor = (status: string) => ({
        pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        in_review: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        on_hold: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    }[status] || "bg-slate-500/10 text-slate-600 border-slate-500/20");

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raw Material Intake</h1>
                    <p className="text-slate-500 mt-1">Log and track inbound raw material batches from weighed deliveries.</p>
                </div>
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-12 shadow-lg shadow-indigo-500/20">
                            <Plus className="w-5 h-5 mr-2" />
                            Log Batch
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-3xl border-slate-200 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Log Raw Material Batch</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Delivery</Label>
                                <Select onValueChange={(v) => setForm((f) => ({ ...f, deliveryId: v }))}>
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="Select received delivery" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deliveries.map((d: any) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.deliveryNumber} — {d.truckRegistration}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Product</Label>
                                <Select onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}>
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="Select product SKU" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.filter((p: any) => p.type === "raw_material").map((p: any) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Quantity Received (KG)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="rounded-xl h-11 border-slate-200"
                                    placeholder="e.g., 4850"
                                    value={form.quantityReceived}
                                    onChange={(e) => setForm((f) => ({ ...f, quantityReceived: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Initial Storage Location</Label>
                                <Select onValueChange={(v) => setForm((f) => ({ ...f, initialLocationId: v }))}>
                                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                                        <SelectValue placeholder="Select intake zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.filter((l: any) => l.isActive).map((l: any) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name} ({l.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Notes (Optional)</Label>
                                <Textarea
                                    className="rounded-xl border-slate-200 min-h-[80px]"
                                    placeholder="Any observations about the batch..."
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                />
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-indigo-500/20"
                                disabled={createBatchMutation.isPending || !form.deliveryId || !form.productId || !form.quantityReceived}
                                onClick={() => createBatchMutation.mutate(form)}
                            >
                                {createBatchMutation.isPending ? "Logging..." : "Log Batch & Send to QC"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Batches", count: rawBatches.length, icon: Layers, color: "text-slate-600", bg: "bg-slate-100" },
                    { label: "Pending QC", count: rawBatches.filter((b: any) => b.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Approved", count: rawBatches.filter((b: any) => b.status === "approved").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Rejected", count: rawBatches.filter((b: any) => b.status === "rejected").length, icon: Package, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((s) => (
                    <Card key={s.label} className="border-none shadow-sm bg-white rounded-3xl">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{s.count}</p>
                            </div>
                            <div className={cn("p-3 rounded-2xl", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Batches List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
            ) : rawBatches.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-white/50 rounded-3xl">
                    <CardContent className="p-20 text-center">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layers className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No batches logged yet</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Log your first raw material batch from a received delivery.</p>
                        <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-xl px-8 h-12 border-slate-200">
                            Log First Batch
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-5">
                        <CardTitle className="text-base font-bold text-slate-900">All Raw Material Batches</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {rawBatches.map((batch: any) => (
                                <div key={batch.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl">
                                            <Layers className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{batch.batchNumber}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {batch.quantityReceived} KG received · {new Date(batch.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase border", getStatusColor(batch.status))}>
                                        {batch.status.replace("_", " ")}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
