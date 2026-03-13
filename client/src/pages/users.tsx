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
    UserPlus,
    ShieldCheck,
    UserX,
    Mail,
    Calendar,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function Users() {
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ["/api/users"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update user");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "Success", description: "User updated successfully" });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const getRoleBadge = (role: string) => {
        const roles: Record<string, string> = {
            'Admin': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            'Plant Manager': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'Production Manager': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'Quality Control': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'Warehouse / Inventory': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            'Dispatch': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        };
        return cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", roles[role] || "bg-slate-100 text-slate-500");
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary-500" />
                            Access Governance
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Manage system users, security roles, and platform permissions.</p>
                    </div>
                    <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary-500/20 font-bold transition-all hover:scale-105">
                        <UserPlus className="w-5 h-5 mr-3" />
                        Provision New User
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Accounts</p>
                                    <p className="text-2xl font-black text-white">{users.filter(u => u.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Admin Privileges</p>
                                    <p className="text-2xl font-black text-white">{users.filter(u => u.role === 'Admin').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <Clock className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Activity</p>
                                    <p className="text-2xl font-black text-white">4h ago</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-2xl">
                                    <UserX className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disabled</p>
                                    <p className="text-2xl font-black text-white">{users.filter(u => !u.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-slate-700/50 px-8 py-6">
                        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">User Directory</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Full listing of all system accounts and their permission levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700/50 hover:bg-transparent">
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Details</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">System Role</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Status</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provisioned At</TableHead>
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
                                    users.map((u) => (
                                        <TableRow key={u.id} className="border-slate-700/50 group hover:bg-slate-800/30 transition-all duration-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-600 transition-transform group-hover:scale-110 group-hover:bg-primary-500/20 group-hover:text-primary-400 group-hover:border-primary-500/50">
                                                        {u.firstName[0]}{u.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{u.firstName} {u.lastName}</p>
                                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <Badge className={getRoleBadge(u.role)}>
                                                    {u.role.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {u.isActive ? (
                                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            ACTIVE
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20 text-[10px] font-bold">
                                                            <XCircle className="w-3 h-3" />
                                                            DISABLED
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(u.createdAt), "MMM d, yyyy")}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 font-medium ml-4.5 mt-0.5">at {format(new Date(u.createdAt), "HH:mm")}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 p-2 rounded-2xl shadow-2xl">
                                                        <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-primary-500/10 focus:text-primary-400">
                                                            Edit User Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-primary-500/10 focus:text-primary-400">
                                                            Change Security Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem
                                                            className={cn(
                                                                "rounded-xl font-bold py-2.5 flex items-center gap-2 transition-colors focus:bg-transparent",
                                                                u.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                                            )}
                                                            onClick={() => updateMutation.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                                                        >
                                                            {u.isActive ? "Deactivate Account" : "Activate Account"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
