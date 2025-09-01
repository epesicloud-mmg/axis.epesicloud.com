import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductionOrderFormData {
  orderNumber: string;
  productType: string;
  targetQuantity: string;
  scheduledDate: string;
}

interface ProductionOrderFormProps {
  onSuccess: () => void;
}

export default function ProductionOrderForm({ onSuccess }: ProductionOrderFormProps) {
  const { toast } = useToast();
  const form = useForm<ProductionOrderFormData>();

  const createProductionOrderMutation = useMutation({
    mutationFn: async (data: ProductionOrderFormData) => {
      await apiRequest("POST", "/api/production-orders", {
        ...data,
        targetQuantity: parseInt(data.targetQuantity),
      });
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "Production order created successfully",
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
        description: "Failed to create production order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductionOrderFormData) => {
    createProductionOrderMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="orderNumber">Order Number</Label>
        <Input
          id="orderNumber"
          {...form.register("orderNumber", { required: true })}
          placeholder="e.g., PO-2024-001"
        />
      </div>

      <div>
        <Label htmlFor="productType">Product Type</Label>
        <Select onValueChange={(value) => form.setValue("productType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flour_2kg">Flour 2kg packages</SelectItem>
            <SelectItem value="flour_4kg">Flour 4kg packages</SelectItem>
            <SelectItem value="flour_10kg">Flour 10kg packages</SelectItem>
            <SelectItem value="flour_25kg">Flour 25kg packages</SelectItem>
            <SelectItem value="flour_50kg">Flour 50kg packages</SelectItem>
            <SelectItem value="bran">Bran</SelectItem>
            <SelectItem value="screenings">Screenings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="targetQuantity">Target Quantity (units)</Label>
        <Input
          id="targetQuantity"
          type="number"
          {...form.register("targetQuantity", { required: true })}
          placeholder="e.g., 1000"
        />
      </div>

      <div>
        <Label htmlFor="scheduledDate">Scheduled Date</Label>
        <Input
          id="scheduledDate"
          type="datetime-local"
          {...form.register("scheduledDate")}
        />
      </div>

      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={createProductionOrderMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {createProductionOrderMutation.isPending ? "Creating..." : "Create Production Order"}
        </Button>
      </div>
    </form>
  );
}
