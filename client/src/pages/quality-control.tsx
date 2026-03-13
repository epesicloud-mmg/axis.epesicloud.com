import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import QualityCheckForm from "@/components/forms/quality-check-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ClipboardCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualityCheck, RawMaterialBatch } from "@shared/schema";

export default function QualityControl() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: qualityChecks = [], isLoading: checksLoading } = useQuery<QualityCheck[]>({
    queryKey: ["/api/quality-checks"],
    retry: false,
  });

  const { data: rawBatches = [] } = useQuery<RawMaterialBatch[]>({
    queryKey: ["/api/raw-material-batches"],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "released":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected":
      case "blocked":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "on_hold":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "in_review":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "pending":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "released":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "rejected":
      case "blocked":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case "on_hold":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "in_review":
        return <ClipboardCheck className="w-5 h-5 text-indigo-500" />;
      default:
        return <ClipboardCheck className="w-5 h-5 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading Quality Controls...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quality Control Lab</h1>
            <p className="text-slate-500 mt-1">Maintain product excellence through rigorous testing and compliance checks.</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                New Inspection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-slate-200 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Conduct Quality Inspection</DialogTitle>
              </DialogHeader>
              <QualityCheckForm
                batches={rawBatches}
                onSuccess={() => {
                  setShowForm(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/quality-checks"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Quality Check Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Approved", count: qualityChecks.filter((c: any) => c.status === "approved").length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "In Review", count: qualityChecks.filter((c: any) => c.status === "in_review").length, icon: ClipboardCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
            { label: "On Hold", count: qualityChecks.filter((c: any) => c.status === "on_hold").length, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Rejected", count: qualityChecks.filter((c: any) => c.status === "rejected").length, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-white rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.count}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quality Checks List */}
        {checksLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : qualityChecks.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-white/50 rounded-3xl overflow-hidden">
            <CardContent className="p-20 text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardCheck className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No inspections recorded</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start by recording your first quality check for incoming raw materials or production batches.</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-xl px-8 h-12 border-slate-200 text-slate-700 hover:bg-slate-50">
                Conduct Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6">
              <CardTitle className="text-lg font-bold text-slate-900">Inspection History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {qualityChecks.map((check: any) => (
                  <div key={check.id} className="group flex items-center justify-between p-6 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-center space-x-6">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-primary-100 transition-colors">
                        {getStatusIcon(check.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">
                            {check.checkNumber || 'QC-TBD'}
                          </h4>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 border-none">
                            {check.checkType?.replace('_', ' ') || 'GENERAL'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-slate-400 font-medium">Batch: <span className="text-slate-600 font-bold">{check.batchId || check.finishedBatchId || 'N/A'}</span></p>
                          {check.moistureLevel && (
                            <p className="text-xs text-slate-400 font-medium">Moisture: <span className="text-slate-600 font-bold">{check.moistureLevel}%</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase border", getStatusColor(check.status))}>
                        {check.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(check.checkedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
