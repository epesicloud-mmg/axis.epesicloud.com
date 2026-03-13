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
    Truck,
    MapPin,
    Phone,
    Mail,
    MoreVertical,
    CheckCircle2,
    XCircle,
    PackageCheck,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Supplier {
    id: string;
    name: string;
    supplierCode: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
    createdAt: string;
}

export default function Suppliers() {
    const { toast } = useToast();
    const { user } = useAuth();
    const canManage = ['Admin', 'Procurement'].includes(user?.role || '');

    const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
        queryKey: ["/api/master-data/suppliers"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
            const res = await fetch(`/api/master-data/suppliers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update supplier");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/master-data/suppliers"] });
            toast({ title: "Success", description: "Supplier updated successfully" });
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
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Truck className="w-8 h-8 text-primary-500" />
                            Supplier Directory
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Manage raw material providers and inbound supply chain partners.</p>
                    </div>
                    {canManage && (
                        <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary-500/20 font-bold transition-all hover:scale-105">
                            <Plus className="w-5 h-5 mr-3" />
                            Onboard New Supplier
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <PackageCheck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Suppliers</p>
                                    <p className="text-2xl font-black text-white">{suppliers.filter(s => s.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Truck className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Partners</p>
                                    <p className="text-2xl font-black text-white">{suppliers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-2xl">
                                    <XCircle className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deactivated</p>
                                    <p className="text-2xl font-black text-white">{suppliers.filter(s => !s.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-slate-700/50 px-8 py-6">
                        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">Supplier Master Data</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Critical contact and location details for all verified partners.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700/50 hover:bg-transparent">
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier Name / Code</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location / Address</TableHead>
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
                                    suppliers.map((s) => (
                                        <TableRow key={s.id} className="border-slate-700/50 group hover:bg-slate-800/30 transition-all duration-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-600 transition-transform group-hover:scale-110 group-hover:bg-primary-500/20 group-hover:text-primary-400 group-hover:border-primary-500/50">
                                                        {s.supplierCode.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{s.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">{s.supplierCode}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-200">{s.contactPerson}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 transition-colors group-hover:text-slate-300">
                                                            <Phone className="w-3 h-3" />
                                                            {s.phone}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 transition-colors group-hover:text-slate-300">
                                                            <Mail className="w-3 h-3" />
                                                            {s.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <p className="text-xs text-slate-400 font-medium flex items-start gap-1.5 max-w-[200px] leading-relaxed">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-600 shrink-0" />
                                                    {s.address}
                                                </p>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                {s.isActive ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        VERIFIED
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-500/20 text-[10px] font-bold">
                                                        <Clock className="w-3 h-3" />
                                                        INACTIVE
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
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-primary-500/10 focus:text-primary-400">
                                                                Edit Partner Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-primary-500/10 focus:text-primary-400">
                                                                View Supply History
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800" />
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-xl font-bold py-2.5 flex items-center gap-2 transition-colors focus:bg-transparent",
                                                                    s.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                                                )}
                                                                onClick={() => updateMutation.mutate({ id: s.id, data: { isActive: !s.isActive } })}
                                                            >
                                                                {s.isActive ? "Deactivate Partner" : "Activate Partner"}
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
