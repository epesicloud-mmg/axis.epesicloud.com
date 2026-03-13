import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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
    Plus,
    Warehouse,
    Map,
    Box,
    HardHat,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Cylinder,
    Info
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import TopNavigation from "@/components/layout/top-navigation";
import { cn } from "@/lib/utils";

interface StorageLocation {
    id: string;
    code: string;
    name: string;
    zone: string;
    itemType: "raw_material" | "finished_product" | "both";
    isActive: boolean;
    notes: string | null;
    createdAt: string;
}

export default function StorageLocations() {
    const { toast } = useToast();
    const { user } = useAuth();
    const canManage = ['Admin', 'Warehouse'].includes(user?.role || '');

    const { data: locations = [], isLoading } = useQuery<StorageLocation[]>({
        queryKey: ["/api/locations"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<StorageLocation> }) => {
            const res = await fetch(`/api/locations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update location");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
            toast({ title: "Success", description: "Storage location updated successfully" });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 pt-6">
            <TopNavigation />

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Warehouse className="w-8 h-8 text-emerald-500" />
                            Storage Infrastructure
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Define and monitor warehouse silos, floor zones, and distribution racks.</p>
                    </div>
                    {canManage && (
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 h-12 shadow-lg shadow-emerald-500/20 font-bold transition-all hover:scale-105">
                            <Plus className="w-5 h-5 mr-3" />
                            Add Storage Unit
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Cylinder className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Silos</p>
                                    <p className="text-2xl font-black text-white">{locations.filter(l => l.zone.toLowerCase().includes('silo') && l.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <Box className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Locations</p>
                                    <p className="text-2xl font-black text-white">{locations.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <HardHat className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Maintenance Mode</p>
                                    <p className="text-2xl font-black text-white">{locations.filter(l => !l.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-slate-700/50 px-8 py-6">
                        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">Facility Map & Hierarchy</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Logical organization of space for optimized material handling and traceability.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700/50 hover:bg-transparent">
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location Name / Code</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Zone / Sector</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized Item Types</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="px-8 py-4 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse border-slate-700/50">
                                            <TableCell colSpan={5} className="h-16 px-8 bg-slate-800/20"></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    locations.map((l) => (
                                        <TableRow key={l.id} className="border-slate-700/50 group hover:bg-slate-800/30 transition-all duration-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-600 transition-transform group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 group-hover:border-emerald-500/50">
                                                        {l.code.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{l.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">{l.code}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                                    <Map className="w-3.5 h-3.5 text-slate-500" />
                                                    {l.zone}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[10px] font-black tracking-wider uppercase",
                                                        l.itemType === "raw_material" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            l.itemType === "finished_product" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                                "bg-slate-500/10 text-slate-300 border-slate-500/20"
                                                    )}>
                                                        {l.itemType.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                {l.isActive ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        OPERATIONAL
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-500/20 text-[10px] font-bold">
                                                        <XCircle className="w-3 h-3" />
                                                        UNDER MAINT.
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                {canManage && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                                                                <MoreVertical className="w-5 h-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 p-2 rounded-2xl shadow-2xl">
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-emerald-500/10 focus:text-emerald-400">
                                                                Modify Parameters
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-emerald-500/10 focus:text-emerald-400">
                                                                Current Stock View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800" />
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-xl font-bold py-2.5 flex items-center gap-2 transition-colors focus:bg-transparent",
                                                                    l.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                                                )}
                                                                onClick={() => updateMutation.mutate({ id: l.id, data: { isActive: !l.isActive } })}
                                                            >
                                                                {l.isActive ? "Set Offline" : "Set Operational"}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
