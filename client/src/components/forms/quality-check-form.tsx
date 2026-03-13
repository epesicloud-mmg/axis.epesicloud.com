import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardCheck, Hash, Layers, Beaker, FileText } from "lucide-react";

interface QualityCheckFormData {
  checkNumber: string;
  batchId?: string;
  finishedBatchId?: string;
  checkType: string;
  moistureLevel: string;
  contamination: boolean;
  grainIntegrity: string;
  notes: string;
  status: string;
  parameters?: any;
}

interface QualityCheckFormProps {
  batches: any[];
  finishedBatches?: any[];
  onSuccess: () => void;
}

export default function QualityCheckForm({ batches, finishedBatches = [], onSuccess }: QualityCheckFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<QualityCheckFormData>({
    defaultValues: {
      checkNumber: `QC-${Date.now().toString().slice(-6)}`,
      contamination: false,
      status: "pending",
      checkType: "raw_material"
    }
  });

  const checkType = form.watch("checkType");

  const createQualityCheckMutation = useMutation({
    mutationFn: async (data: QualityCheckFormData) => {
      await apiRequest("POST", "/api/quality-checks", {
        ...data,
        inspectorId: user?.id,
        checkedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "Inspection recorded and logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record inspection result",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QualityCheckFormData) => {
    createQualityCheckMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="checkNumber" className="text-xs font-bold text-slate-500 uppercase">Inspection Number</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="checkNumber"
              {...form.register("checkNumber", { required: true })}
              className="pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all h-11"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkType" className="text-xs font-bold text-slate-500 uppercase">Inspection Type</Label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Select onValueChange={(value) => form.setValue("checkType", value)} defaultValue="raw_material">
              <SelectTrigger className="pl-10 rounded-xl border-slate-200 h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="raw_material">Raw Material (Inbound)</SelectItem>
                <SelectItem value="ipqc">IPQC (In-Production)</SelectItem>
                <SelectItem value="fgqc">FGQC (Finished Goods)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="batch" className="text-xs font-bold text-slate-500 uppercase">
          {checkType === "fgqc" ? "Finished Product Batch" : "Raw Material / Process Batch"}
        </Label>
        <div className="relative">
          <Beaker className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Select
            onValueChange={(value) => {
              if (checkType === "fgqc") {
                form.setValue("finishedBatchId", value);
                form.setValue("batchId", undefined);
              } else {
                form.setValue("batchId", value);
                form.setValue("finishedBatchId", undefined);
              }
            }}
          >
            <SelectTrigger className="pl-10 rounded-xl border-slate-200 h-11">
              <SelectValue placeholder="Select batch reference" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              {checkType === "fgqc" ? (
                finishedBatches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batchNumber} - {batch.quantity}kg
                  </SelectItem>
                ))
              ) : (
                batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batchNumber} - {batch.quantity}kg
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="moistureLevel" className="text-xs font-bold text-slate-500 uppercase">Moisture Content (%)</Label>
          <Input
            id="moistureLevel"
            type="number"
            step="0.1"
            {...form.register("moistureLevel")}
            className="rounded-xl border-slate-200 h-11"
            placeholder="e.g., 12.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grainIntegrity" className="text-xs font-bold text-slate-500 uppercase">Grain Integrity / Quality Level</Label>
          <Select onValueChange={(value) => form.setValue("grainIntegrity", value)}>
            <SelectTrigger className="rounded-xl border-slate-200 h-11">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="excellent">Excellent - Grade A</SelectItem>
              <SelectItem value="good">Good - Grade B</SelectItem>
              <SelectItem value="fair">Fair - Acceptable</SelectItem>
              <SelectItem value="poor">Poor - Below Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <Checkbox
          id="contamination"
          checked={form.watch("contamination")}
          onCheckedChange={(checked) => form.setValue("contamination", !!checked)}
          className="rounded-md border-slate-300"
        />
        <Label htmlFor="contamination" className="text-sm font-bold text-slate-700">Visual Contamination Detected</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-xs font-bold text-slate-500 uppercase">Final Decision</Label>
        <Select onValueChange={(value) => form.setValue("status", value)}>
          <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold">
            <SelectValue placeholder="Select final status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            <SelectItem value="approved" className="text-emerald-600 font-bold">Approved / Passed</SelectItem>
            <SelectItem value="in_review" className="text-indigo-600 font-bold">Pending Review</SelectItem>
            <SelectItem value="on_hold" className="text-amber-600 font-bold">On Hold / Quarantine</SelectItem>
            <SelectItem value="rejected" className="text-rose-600 font-bold">Rejected / Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold text-slate-500 uppercase">Technical Observations</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Textarea
            id="notes"
            {...form.register("notes")}
            className="pl-10 rounded-xl border-slate-200 h-24 focus:ring-primary-500"
            placeholder="Document any specific observations or deviation from standards..."
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={createQualityCheckMutation.isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]"
      >
        {createQualityCheckMutation.isPending ? "Submitting Inspection..." : "Log Inspection Result"}
      </Button>
    </form>
  );
}
