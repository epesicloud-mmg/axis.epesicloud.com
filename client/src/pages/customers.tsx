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
    Users,
    MapPin,
    Phone,
    Mail,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Package,
    Clock,
    UserCircle
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string;
    customerCode: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
    createdAt: string;
}

export default function Customers() {
    const { toast } = useToast();
    const { user } = useAuth();
    const canManage = ['Admin', 'Dispatch'].includes(user?.role || '');

    const { data: customers = [], isLoading } = useQuery<Customer[]>({
        queryKey: ["/api/master-data/customers"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
            const res = await fetch(`/api/master-data/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update customer");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/master-data/customers"] });
            toast({ title: "Success", description: "Customer updated successfully" });
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
                            <Users className="w-8 h-8 text-blue-500" />
                            Customer Directory
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Manage client relationships and distribution chain partners.</p>
                    </div>
                    {canManage && (
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 h-12 shadow-lg shadow-blue-500/20 font-bold transition-all hover:scale-105">
                            <Plus className="w-5 h-5 mr-3" />
                            Register New Customer
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Clients</p>
                                    <p className="text-2xl font-black text-white">{customers.filter(c => c.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Package className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Accounts</p>
                                    <p className="text-2xl font-black text-white">{customers.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <Clock className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Sync</p>
                                    <p className="text-2xl font-black text-white">0</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-slate-700/50 px-8 py-6">
                        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">Customer Master Data</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Verified distribution points and authorized receiver contact list.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700/50 hover:bg-transparent">
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer Name / Code</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Address</TableHead>
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
                                    customers.map((c) => (
                                        <TableRow key={c.id} className="border-slate-700/50 group hover:bg-slate-800/30 transition-all duration-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-600 transition-transform group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/50">
                                                        {c.customerCode.substring(0, 3)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{c.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">{c.customerCode}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                                        <UserCircle className="w-3.5 h-3.5 text-slate-500" />
                                                        {c.contactPerson}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5 ml-5">
                                                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 transition-colors group-hover:text-slate-300">
                                                            <Phone className="w-3 h-3" />
                                                            {c.phone}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 transition-colors group-hover:text-slate-300">
                                                            <Mail className="w-3 h-3" />
                                                            {c.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <p className="text-xs text-slate-400 font-medium flex items-start gap-1.5 max-w-[220px] leading-relaxed">
                                                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-600 shrink-0" />
                                                    {c.address}
                                                </p>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                {c.isActive ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        ACTIVE
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-500/20 text-[10px] font-bold">
                                                        <XCircle className="w-3 h-3" />
                                                        DISABLED
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
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-blue-500/10 focus:text-blue-400">
                                                                Edit Customer Data
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-blue-500/10 focus:text-blue-400">
                                                                Dispatch History
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800" />
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-xl font-bold py-2.5 flex items-center gap-2 transition-colors focus:bg-transparent",
                                                                    c.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                                                )}
                                                                onClick={() => updateMutation.mutate({ id: c.id, data: { isActive: !c.isActive } })}
                                                            >
                                                                {c.isActive ? "Deactivate Account" : "Activate Account"}
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
