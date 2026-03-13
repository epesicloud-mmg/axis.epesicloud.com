import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    User,
    Database,
    Clock,
    Search,
    ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

export default function AuditLogs() {
    const [search, setSearch] = useState("");

    const { data: logs, isLoading } = useQuery<any[]>({
        queryKey: ["/api/audit-logs"],
    });

    const filteredLogs = logs?.filter(log =>
        log.entityType.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entityId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 bg-[#0a0b14] min-h-screen text-slate-200">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                            AUDIT <span className="text-indigo-500">TRAIL</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Immutable governance logs for system-wide integrity</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <Input
                            placeholder="Search logs by entity or action..."
                            className="pl-10 h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:ring-indigo-500/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>

                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-800/60 p-6 bg-slate-900/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                                <Activity className="h-6 w-6 text-indigo-400" />
                            </div>
                            <CardTitle className="text-xl font-bold text-white">System Events</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-20 text-center text-slate-500">
                                <div className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 animate-spin rounded-full mx-auto mb-4"></div>
                                Syncing audit chain...
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800/80 hover:bg-transparent uppercase tracking-wider">
                                        <TableHead className="text-slate-500 font-bold py-4">Timestamp</TableHead>
                                        <TableHead className="text-slate-500 font-bold">Actor</TableHead>
                                        <TableHead className="text-slate-500 font-bold">Action</TableHead>
                                        <TableHead className="text-slate-500 font-bold">Entity</TableHead>
                                        <TableHead className="text-slate-500 font-bold">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs?.map((log) => (
                                        <TableRow key={log.id} className="border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Clock className="h-4 w-4 text-slate-500" />
                                                    <span className="font-mono text-xs">
                                                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                                        <User className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <span className="font-medium text-slate-400">ID: {log.actorId || "System"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`
                          rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight
                          ${log.action === 'create' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        log.action === 'status_change' ? 'bg-indigo-500/20 text-indigo-400' :
                                                            'bg-slate-700/50 text-slate-300'}
                        `}>
                                                    {log.action.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Database className="h-4 w-4 text-slate-600" />
                                                    <span className="text-slate-300 font-bold text-sm uppercase">{log.entityType}</span>
                                                    <span className="text-slate-500 font-mono text-xs ml-1">#{log.entityId.slice(0, 8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3 max-w-xs overflow-hidden">
                                                    {log.previousValues?.status && (
                                                        <>
                                                            <span className="text-slate-500 text-[10px]">{log.previousValues.status}</span>
                                                            <ArrowRight className="h-3 w-3 text-slate-700" />
                                                        </>
                                                    )}
                                                    <span className="text-indigo-400 font-bold text-xs truncate">
                                                        {log.newValues?.status || 'Operation Logged'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredLogs?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center text-slate-500 font-medium">
                                                No governance records found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
