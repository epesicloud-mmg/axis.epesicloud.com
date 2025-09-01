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

interface QualityCheckFormData {
  batchId: string;
  checkType: string;
  moistureLevel: string;
  contamination: boolean;
  grainIntegrity: string;
  notes: string;
  status: string;
}

interface QualityCheckFormProps {
  batches: any[];
  onSuccess: () => void;
}

export default function QualityCheckForm({ batches, onSuccess }: QualityCheckFormProps) {
  const { toast } = useToast();
  const form = useForm<QualityCheckFormData>({
    defaultValues: {
      contamination: false,
      status: "pending"
    }
  });

  const createQualityCheckMutation = useMutation({
    mutationFn: async (data: QualityCheckFormData) => {
      await apiRequest("POST", "/api/quality-checks", data);
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "Quality check recorded successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to record quality check",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QualityCheckFormData) => {
    createQualityCheckMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="batchId">Raw Material Batch</Label>
        <Select onValueChange={(value) => form.setValue("batchId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select batch to check" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.batchNumber} - {batch.quantity}kg
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="checkType">Check Type</Label>
        <Select onValueChange={(value) => form.setValue("checkType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select check type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="raw_material">Raw Material</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="packaging">Packaging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="moistureLevel">Moisture Level (%)</Label>
        <Input
          id="moistureLevel"
          type="number"
          step="0.1"
          {...form.register("moistureLevel")}
          placeholder="e.g., 12.5"
        />
      </div>

      <div>
        <Label htmlFor="grainIntegrity">Grain Integrity</Label>
        <Select onValueChange={(value) => form.setValue("grainIntegrity", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select grain integrity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="contamination"
          checked={form.watch("contamination")}
          onCheckedChange={(checked) => form.setValue("contamination", !!checked)}
        />
        <Label htmlFor="contamination">Contamination detected</Label>
      </div>

      <div>
        <Label htmlFor="status">Quality Status</Label>
        <Select onValueChange={(value) => form.setValue("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Additional notes about the quality check"
          rows={3}
        />
      </div>

      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={createQualityCheckMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {createQualityCheckMutation.isPending ? "Recording..." : "Record Quality Check"}
        </Button>
      </div>
    </form>
  );
}
