import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Layers, Package, Calendar, Beaker } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProductionOrderFormData {
  orderNumber: string;
  productType: string;
  targetQuantity: string;
  scheduledDate: string;
  rawMaterialBatchId: string;
}

interface ProductionOrderFormProps {
  onSuccess: () => void;
}

export default function ProductionOrderForm({ onSuccess }: ProductionOrderFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProductionOrderFormData>({
    defaultValues: {
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      scheduledDate: new Date().toISOString().slice(0, 16)
    }
  });

  const { data: rawBatches = [] } = useQuery<any[]>({
    queryKey: ["/api/raw-material-batches"],
    select: (batches) => batches.filter(b => b.qualityStatus === 'passed' && parseFloat(b.quantity) > 0)
  });

  const createProductionOrderMutation = useMutation({
    mutationFn: async (data: ProductionOrderFormData) => {
      await apiRequest("POST", "/api/production-orders", {
        ...data,
        targetQuantity: parseInt(data.targetQuantity),
        supervisorId: user?.id,
        status: "scheduled"
      });
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
      toast({
        title: "Work Order Initialized",
        description: "Production sequence has been scheduled.",
      });
    },
    onError: () => {
      toast({
        title: "Initialization Failed",
        description: "Check parameters and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductionOrderFormData) => {
    createProductionOrderMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="orderNumber" className="text-xs font-bold text-slate-500 uppercase">Work Order ID</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="orderNumber"
              {...form.register("orderNumber", { required: true })}
              className="pl-10 rounded-xl border-slate-200 bg-slate-50 h-11 transition-all"
              readOnly
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productType" className="text-xs font-bold text-slate-500 uppercase">Product Line</Label>
          <div className="relative">
            <Layers className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Select onValueChange={(value) => form.setValue("productType", value)}>
              <SelectTrigger className="pl-10 rounded-xl border-slate-200 h-11">
                <SelectValue placeholder="Select output" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="grade_1_flour">Grade 1 Maize Flour</SelectItem>
                <SelectItem value="grade_2_flour">Grade 2 Maize Flour</SelectItem>
                <SelectItem value="bran">Milling Bran</SelectItem>
                <SelectItem value="germ">Maize Germ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawMaterialBatchId" className="text-xs font-bold text-slate-500 uppercase">Input Feed (Raw Batch)</Label>
        <div className="relative">
          <Beaker className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Select onValueChange={(value) => form.setValue("rawMaterialBatchId", value)}>
            <SelectTrigger className="pl-10 rounded-xl border-slate-200 h-11">
              <SelectValue placeholder="Select available inventory" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              {rawBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batchNumber} - {batch.quantity}kg Available
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="targetQuantity" className="text-xs font-bold text-slate-500 uppercase">Target Output (Units)</Label>
          <div className="relative">
            <Package className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="targetQuantity"
              type="number"
              {...form.register("targetQuantity", { required: true })}
              className="pl-10 rounded-xl border-slate-200 h-11"
              placeholder="e.g., 5000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledDate" className="text-xs font-bold text-slate-500 uppercase">Commencement Schedule</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="scheduledDate"
              type="datetime-local"
              {...form.register("scheduledDate")}
              className="pl-10 rounded-xl border-slate-200 h-11"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={createProductionOrderMutation.isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]"
        >
          {createProductionOrderMutation.isPending ? "Configuring Line..." : "Initialize Production Sequence"}
        </Button>
      </div>
    </form>
  );
}
