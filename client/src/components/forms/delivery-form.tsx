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
import { Plus, User, Phone, Hash, Truck } from "lucide-react";

interface DeliveryFormData {
  truckRegistration: string;
  supplierId: string;
  productId: string;
  expectedQuantity: string;
  deliveryNumber: string;
  driverName: string;
  driverPhone: string;
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
  products: any[];
  onSuccess: () => void;
}

export default function DeliveryForm({ suppliers, products, onSuccess }: DeliveryFormProps) {
  const { toast } = useToast();
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  const deliveryForm = useForm<DeliveryFormData>({
    defaultValues: {
      deliveryNumber: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
    }
  });
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
        description: "Truck scheduled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule truck arrival",
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
    },
    onError: (error) => {
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
    <div className="space-y-6 pt-4">
      <form onSubmit={deliveryForm.handleSubmit(onSubmitDelivery)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="deliveryNumber" className="text-xs font-bold text-slate-500 uppercase">Delivery Number</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="deliveryNumber"
                {...deliveryForm.register("deliveryNumber", { required: true })}
                className="pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all h-11"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="truckRegistration" className="text-xs font-bold text-slate-500 uppercase">Truck Registration</Label>
            <div className="relative">
              <Truck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="truckRegistration"
                {...deliveryForm.register("truckRegistration", { required: true })}
                className="pl-10 rounded-xl border-slate-200 focus:ring-primary-500 h-11"
                placeholder="e.g., KAB 123X"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId" className="text-xs font-bold text-slate-500 uppercase">Supplier Source</Label>
          <div className="flex space-x-2">
            <Select onValueChange={(value) => deliveryForm.setValue("supplierId", value)}>
              <SelectTrigger className="flex-1 rounded-xl border-slate-200 h-11 text-slate-600">
                <SelectValue placeholder="Search or select supplier" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id} className="rounded-lg">
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="rounded-xl border-slate-200 h-11 w-11 hover:bg-slate-50">
                  <Plus className="w-5 h-5 text-slate-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-slate-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Register New Supplier</DialogTitle>
                </DialogHeader>
                <form onSubmit={supplierForm.handleSubmit(onSubmitSupplier)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-bold text-slate-400 uppercase">Company Name</Label>
                    <Input id="name" {...supplierForm.register("name", { required: true })} className="rounded-xl h-11 border-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</Label>
                      <Input id="contactPerson" {...supplierForm.register("contactPerson")} className="rounded-xl h-11 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</Label>
                      <Input id="phone" {...supplierForm.register("phone")} className="rounded-xl h-11 border-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase">Email Address</Label>
                    <Input id="email" type="email" {...supplierForm.register("email")} className="rounded-xl h-11 border-slate-200" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <Button type="submit" disabled={createSupplierMutation.isPending} className="flex-1 rounded-xl h-11 bg-slate-900 font-bold">
                      {createSupplierMutation.isPending ? "Saving..." : "Create Supplier"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowSupplierForm(false)} className="px-6 rounded-xl h-11 border-slate-200 font-bold">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productId" className="text-xs font-bold text-slate-500 uppercase">Product / SKU</Label>
          <Select onValueChange={(value) => deliveryForm.setValue("productId", value)}>
            <SelectTrigger className="rounded-xl border-slate-200 h-11 text-slate-600">
              <SelectValue placeholder="Identify product being delivered" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id} className="rounded-lg">
                  {product.name} ({product.sku})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="driverName" className="text-xs font-bold text-slate-500 uppercase">Driver Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="driverName"
                {...deliveryForm.register("driverName", { required: true })}
                className="pl-10 rounded-xl border-slate-200 focus:ring-primary-500 h-11"
                placeholder="Full name as on ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driverPhone" className="text-xs font-bold text-slate-500 uppercase">Driver Contact</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="driverPhone"
                {...deliveryForm.register("driverPhone", { required: true })}
                className="pl-10 rounded-xl border-slate-200 h-11"
                placeholder="Mobile number"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedQuantity" className="text-xs font-bold text-slate-500 uppercase">Expected Weight (KG)</Label>
          <Input
            id="expectedQuantity"
            type="number"
            step="0.01"
            {...deliveryForm.register("expectedQuantity", { required: true })}
            className="rounded-xl border-slate-200 h-11 text-lg font-medium"
            placeholder="e.g., 5000"
          />
        </div>

        <Button
          type="submit"
          disabled={createDeliveryMutation.isPending}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
        >
          {createDeliveryMutation.isPending ? "Processing..." : "Register & Generate Tracking ID"}
        </Button>
      </form>
    </div>
  );
}
