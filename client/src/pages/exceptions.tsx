import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Clock,
    Search,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    ArrowRight,
    Filter,
    MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Exceptions() {
    const [search, setSearch] = useState("");
    const { toast } = useToast();

    const { data: exceptions, isLoading } = useQuery<any[]>({
        queryKey: ["/api/exceptions"],
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, notes }: { id: string, status: string, notes?: string }) => {
            const res = await apiRequest("PATCH", `/api/exceptions/${id}/status`, { status, notes });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/exceptions"] });
            toast({ title: "Exception Updated", description: "The anomaly status has been synchronized." });
        },
    });

    const filteredExceptions = exceptions?.filter(ex =>
        ex.exceptionType.toLowerCase().includes(search.toLowerCase()) ||
        ex.relatedEntityType.toLowerCase().includes(search.toLowerCase()) ||
        ex.description.toLowerCase().includes(search.toLowerCase())
    );

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    return (
        <div className="p-8 bg-[#0a0b14] min-h-screen text-slate-200">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                            EXCEPTION <span className="text-rose-500">HANDLING</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Anomalies and quality failures requiring resolution</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <Input
                                placeholder="Search anomalies..."
                                className="pl-10 h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 border-slate-800 bg-slate-900/50 rounded-2xl text-slate-400 hover:bg-slate-800">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/20 rounded-2xl">
                                <ShieldAlert className="h-7 w-7 text-rose-400" />
                            </div>
                            <div>
                                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">Unresolved</div>
                                <div className="text-3xl font-black text-white">
                                    {exceptions?.filter(e => e.status === 'open').length || 0}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-2xl">
                                <AlertTriangle className="h-7 w-7 text-amber-400" />
                            </div>
                            <div>
                                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">High Risk</div>
                                <div className="text-3xl font-black text-white">
                                    {exceptions?.filter(e => e.severity === 'high').length || 0}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl p-6 md:col-span-2">
                        <div className="flex items-center justify-between h-full">
                            <div className="space-y-1">
                                <div className="text-slate-300 font-bold">System Integrity Score</div>
                                <div className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> 98.2% healthy operations today
                                </div>
                            </div>
                            <div className="h-12 w-48 bg-slate-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-emerald-500/20 w-[98%]"></div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="p-20 text-center text-slate-500">
                            <div className="h-10 w-10 border-4 border-rose-500/30 border-t-rose-500 animate-spin rounded-full mx-auto mb-4"></div>
                            Analyzing anomaly database...
                        </div>
                    ) : filteredExceptions?.map((ex) => (
                        <Card key={ex.id} className={`bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl overflow-hidden group transition-all hover:border-slate-700/80 ${ex.status === 'resolved' ? 'opacity-60' : ''}`}>
                            <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                                <div className={`p-4 rounded-2xl ${ex.status === 'resolved' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                    {ex.status === 'resolved' ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-rose-400" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`border uppercase tracking-widest text-[10px] font-black ${getSeverityColor(ex.severity)}`}>
                                            {ex.severity} RISK
                                        </Badge>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(ex.createdAt), "MMM dd, HH:mm")}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {ex.exceptionType.replace('_', ' ').toUpperCase()}
                                            <ArrowRight className="h-4 w-4 text-slate-700" />
                                            <span className="text-slate-400 text-sm font-medium uppercase font-mono">{ex.relatedEntityType} #{ex.relatedEntityId.slice(0, 8)}</span>
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1 leading-relaxed">{ex.description}</p>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 shrink-0 self-center">
                                    {ex.status === 'open' ? (
                                        <>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6"
                                                onClick={() => updateStatusMutation.mutate({ id: ex.id, status: 'resolved' })}
                                            >
                                                Resolve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-slate-800 bg-slate-900/50 text-slate-400 rounded-xl hover:bg-slate-800"
                                                onClick={() => updateStatusMutation.mutate({ id: ex.id, status: 'closed' })}
                                            >
                                                Dismiss
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold text-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            RESOLVED
                                        </div>
                                    )}
                                </div>
                            </div>

                            {ex.resolutionNotes && (
                                <div className="bg-slate-900/20 border-t border-slate-800/40 p-4 px-6 flex items-start gap-3">
                                    <MessageSquare className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-slate-500">
                                        <span className="text-slate-300 font-bold uppercase tracking-wider mr-2">Resolution Note:</span>
                                        {ex.resolutionNotes}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                    {filteredExceptions?.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="p-4 bg-emerald-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">All exceptions cleared</h2>
                            <p className="text-slate-500 mt-2">Surface is clear of any operational anomalies.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
