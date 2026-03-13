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
    Package,
    Tag,
    Layers,
    Shapes,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ShoppingBag,
    FlaskConical,
    Boxes
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    sku: string;
    name: string;
    productType: "raw_material" | "finished_product";
    packageSize: string;
    unitOfMeasure: string;
    isActive: boolean;
    createdAt: string;
}

export default function Products() {
    const { toast } = useToast();
    const { user } = useAuth();
    const canManage = ['Admin', 'Production Manager'].includes(user?.role || '');

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update product");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Success", description: "Product updated successfully" });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const rawMaterials = products.filter(p => p.productType === "raw_material");
    const finishedProducts = products.filter(p => p.productType === "finished_product");

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8">

            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Package className="w-8 h-8 text-indigo-500" />
                            Product Catalog
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium italic">Master list of raw material inputs and finished goods inventory SKUs.</p>
                    </div>
                    {canManage && (
                        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 h-12 shadow-lg shadow-indigo-500/20 font-bold transition-all hover:scale-105">
                            <Plus className="w-5 h-5 mr-3" />
                            Define New Product
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    <ShoppingBag className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Finished Goods</p>
                                    <p className="text-2xl font-black text-white">{finishedProducts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <FlaskConical className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Raw Materials</p>
                                    <p className="text-2xl font-black text-white">{rawMaterials.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <Boxes className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active SKUs</p>
                                    <p className="text-2xl font-black text-white">{products.filter(p => p.isActive).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                    <CardHeader className="border-b border-slate-700/50 px-8 py-6">
                        <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">SKU Master Data</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Standardized product definitions, units of measure, and packaging specs.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50">
                                <TableRow className="border-slate-700/50 hover:bg-transparent">
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product / SKU</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</TableHead>
                                    <TableHead className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Specificaions</TableHead>
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
                                    products.map((p) => (
                                        <TableRow key={p.id} className="border-slate-700/50 group hover:bg-slate-800/30 transition-all duration-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-600 transition-transform group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 group-hover:border-indigo-500/50">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-0.5">{p.sku}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <Badge className={cn(
                                                    "rounded-lg px-2 py-0.5 text-[10px] font-black tracking-wider uppercase",
                                                    p.productType === "raw_material"
                                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                        : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                                                )}>
                                                    {p.productType.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Shapes className="w-3.5 h-3.5 text-slate-600" />
                                                        {p.packageSize}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Layers className="w-3.5 h-3.5 text-slate-600" />
                                                        {p.unitOfMeasure}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                {p.isActive ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        ACTIVE
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 bg-slate-500/10 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-500/20 text-[10px] font-bold">
                                                        <XCircle className="w-3 h-3" />
                                                        ARCHIVED
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
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-indigo-500/10 focus:text-indigo-400">
                                                                Update SKU Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-xl font-bold py-2.5 flex items-center gap-2 focus:bg-indigo-500/10 focus:text-indigo-400">
                                                                Inventory Snapshot
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-800" />
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-xl font-bold py-2.5 flex items-center gap-2 transition-colors focus:bg-transparent",
                                                                    p.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                                                )}
                                                                onClick={() => updateMutation.mutate({ id: p.id, data: { isActive: !p.isActive } })}
                                                            >
                                                                {p.isActive ? "Archive SKU" : "Restore SKU"}
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
