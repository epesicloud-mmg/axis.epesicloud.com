import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface DeliveryFormData {
  truckRegistration: string;
  supplierId: string;
  expectedQuantity: string;
}

interface SupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

interface DeliveryFormProps {
  suppliers: any[];
  onSuccess: () => void;
}

export default function DeliveryForm({ suppliers, onSuccess }: DeliveryFormProps) {
  const { toast } = useToast();
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  
  const deliveryForm = useForm<DeliveryFormData>();
  const supplierForm = useForm<SupplierFormData>();

  const createDeliveryMutation = useMutation({
    mutationFn: async (data: DeliveryFormData) => {
      await apiRequest("POST", "/api/deliveries", data);
    },
    onSuccess: () => {
      deliveryForm.reset();
      onSuccess();
      toast({
        title: "Success",
        description: "Delivery registered successfully",
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
        description: "Failed to register delivery",
        variant: "destructive",
      });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      await apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      supplierForm.reset();
      setShowSupplierForm(false);
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
      // Refresh suppliers list would happen via query invalidation
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
        description: "Failed to create supplier",
        variant: "destructive",
      });
    },
  });

  const onSubmitDelivery = (data: DeliveryFormData) => {
    createDeliveryMutation.mutate(data);
  };

  const onSubmitSupplier = (data: SupplierFormData) => {
    createSupplierMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={deliveryForm.handleSubmit(onSubmitDelivery)} className="space-y-4">
        <div>
          <Label htmlFor="truckRegistration">Truck Registration</Label>
          <Input
            id="truckRegistration"
            {...deliveryForm.register("truckRegistration", { required: true })}
            placeholder="e.g., KAB 123X"
          />
        </div>

        <div>
          <Label htmlFor="supplierId">Supplier</Label>
          <div className="flex space-x-2">
            <Select onValueChange={(value) => deliveryForm.setValue("supplierId", value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <form onSubmit={supplierForm.handleSubmit(onSubmitSupplier)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Supplier Name</Label>
                    <Input
                      id="name"
                      {...supplierForm.register("name", { required: true })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      {...supplierForm.register("contactPerson")}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...supplierForm.register("phone")}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...supplierForm.register("email")}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      {...supplierForm.register("address")}
                      placeholder="Complete address"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={createSupplierMutation.isPending}
                    >
                      {createSupplierMutation.isPending ? "Creating..." : "Create Supplier"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSupplierForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="expectedQuantity">Expected Quantity (kg)</Label>
          <Input
            id="expectedQuantity"
            type="number"
            step="0.01"
            {...deliveryForm.register("expectedQuantity", { required: true })}
            placeholder="e.g., 5000"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={createDeliveryMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createDeliveryMutation.isPending ? "Registering..." : "Register Delivery"}
          </Button>
        </div>
      </form>
    </div>
  );
}
