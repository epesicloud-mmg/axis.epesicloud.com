import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import TopNavigation from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Scale, Truck, Calculator, Eye, Plus, FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { WeighbridgeReading, TruckDelivery, InsertWeighbridgeReading } from "@shared/schema";

const weighbridgeSchema = z.object({
  deliveryId: z.string().min(1, "Delivery selection is required"),
  grossWeight: z.string().min(1, "Gross weight is required"),
  tareWeight: z.string().min(1, "Tare weight is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  notes: z.string().optional(),
});

type WeighbridgeFormData = z.infer<typeof weighbridgeSchema>;

export default function Weighbridge() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReading, setSelectedReading] = useState<WeighbridgeReading | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Form setup
  const form = useForm<WeighbridgeFormData>({
    resolver: zodResolver(weighbridgeSchema),
    defaultValues: {
      deliveryId: "",
      grossWeight: "",
      tareWeight: "",
      operatorName: "",
      notes: "",
    },
  });

  // Fetch weighbridge readings
  const { data: readings = [], isLoading: readingsLoading } = useQuery<WeighbridgeReading[]>({
    queryKey: ['/api/weighbridge-readings'],
  });

  // Fetch pending deliveries (for weighbridge processing)
  const { data: pendingDeliveries = [], isLoading: deliveriesLoading } = useQuery<TruckDelivery[]>({
    queryKey: ['/api/deliveries/pending-weighbridge'],
  });

  // Create weighbridge reading mutation
  const createReading = useMutation({
    mutationFn: async (data: WeighbridgeFormData) => {
      const grossWeight = parseFloat(data.grossWeight);
      const tareWeight = parseFloat(data.tareWeight);
      const netWeight = grossWeight - tareWeight;

      const readingData: InsertWeighbridgeReading = {
        deliveryId: data.deliveryId,
        grossWeight: data.grossWeight,
        tareWeight: data.tareWeight,
        netWeight: netWeight.toString(),
        operatorName: data.operatorName,
        notes: data.notes || null,
        readingTime: new Date(),
      };

      return await apiRequest('/api/weighbridge-readings', {
        method: 'POST',
        body: readingData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weighbridge reading recorded successfully",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/weighbridge-readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/pending-weighbridge'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record weighbridge reading",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: WeighbridgeFormData) => {
    createReading.mutate(data);
  };

  // Calculate net weight dynamically
  const grossWeight = parseFloat(form.watch("grossWeight") || "0");
  const tareWeight = parseFloat(form.watch("tareWeight") || "0");
  const netWeight = grossWeight - tareWeight;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 font-sans">
      <TopNavigation />
      
      <div className="flex h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-2 flex items-center">
                    <Scale className="w-7 h-7 text-blue-600 mr-3" />
                    Weighbridge Operations
                  </h2>
                  <p className="text-gray-600">Record and manage truck weighing operations</p>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>New Reading</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Record Weighbridge Reading</DialogTitle>
                      <DialogDescription>
                        Enter the weighbridge measurements for the selected delivery
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="deliveryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Delivery</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose delivery to weigh" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {pendingDeliveries.map((delivery) => (
                                    <SelectItem key={delivery.id} value={delivery.id}>
                                      {delivery.truckRegistration} - {delivery.driverName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="grossWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gross Weight (kg)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1" 
                                    placeholder="Enter gross weight" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tareWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tare Weight (kg)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.1" 
                                    placeholder="Enter tare weight" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Net Weight Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-700 font-medium">Net Weight:</span>
                            <span className="text-xl font-bold text-blue-900">
                              {isNaN(netWeight) ? "0.0" : netWeight.toFixed(1)} kg
                            </span>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="operatorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operator Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter operator name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any additional observations or notes"
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createReading.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {createReading.isPending ? "Recording..." : "Record Reading"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="readings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="readings">Weighbridge Readings</TabsTrigger>
                <TabsTrigger value="pending">Pending Deliveries</TabsTrigger>
              </TabsList>

              {/* Weighbridge Readings Tab */}
              <TabsContent value="readings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Recent Weighbridge Readings
                    </CardTitle>
                    <CardDescription>
                      Complete record of all weighbridge operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {readingsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : readings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Scale className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No weighbridge readings recorded yet</p>
                        <p className="text-sm">Record your first reading to get started</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Truck Details</TableHead>
                              <TableHead>Weights (kg)</TableHead>
                              <TableHead>Operator</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {readings.map((reading) => (
                              <TableRow key={reading.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">{(reading as any).delivery?.truckRegistration || 'N/A'}</div>
                                    <div className="text-sm text-gray-600">{(reading as any).delivery?.driverName || 'N/A'}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm">
                                      <span className="text-gray-600">Gross:</span> {reading.grossWeight} kg
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-gray-600">Tare:</span> {reading.tareWeight} kg
                                    </div>
                                    <div className="text-sm font-medium text-blue-600">
                                      <span className="text-gray-600">Net:</span> {reading.netWeight} kg
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{(reading as any).operatorName || 'N/A'}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {(reading as any).readingTime ? format(new Date((reading as any).readingTime), "MMM dd, HH:mm") : 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReading(reading)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pending Deliveries Tab */}
              <TabsContent value="pending" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Deliveries Awaiting Weighbridge
                    </CardTitle>
                    <CardDescription>
                      Truck deliveries that need to be weighed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {deliveriesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : pendingDeliveries.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No deliveries pending weighbridge</p>
                        <p className="text-sm">All deliveries have been processed</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {pendingDeliveries.map((delivery) => (
                          <div key={delivery.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                  <Truck className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{delivery.truckRegistration}</h3>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>Driver: {delivery.driverName || 'N/A'}</p>
                                    <p>Expected: {delivery.expectedQuantity} kg</p>
                                    <p>Arrived: {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), "MMM dd, HH:mm") : 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-orange-700 border-orange-300">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Awaiting Weighbridge
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    form.setValue("deliveryId", delivery.id);
                                    setIsDialogOpen(true);
                                  }}
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  <Calculator className="w-3 h-3 mr-1" />
                                  Weigh Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Reading Details Dialog */}
      {selectedReading && (
        <Dialog open={!!selectedReading} onOpenChange={() => setSelectedReading(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Weighbridge Reading Details</DialogTitle>
              <DialogDescription>
                Complete information for this weighing operation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Truck Registration</Label>
                  <p className="text-sm">{selectedReading.delivery?.truckRegistration}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Driver Name</Label>
                  <p className="text-sm">{selectedReading.delivery?.driverName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Gross Weight</Label>
                  <p className="text-lg font-medium text-blue-600">{selectedReading.grossWeight} kg</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Tare Weight</Label>
                  <p className="text-lg font-medium text-gray-600">{selectedReading.tareWeight} kg</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Net Weight</Label>
                  <p className="text-lg font-bold text-green-600">{selectedReading.netWeight} kg</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Operator</Label>
                <p className="text-sm">{selectedReading.operatorName}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Reading Time</Label>
                <p className="text-sm">{format(new Date(selectedReading.readingTime), "MMMM dd, yyyy 'at' HH:mm")}</p>
              </div>
              
              {selectedReading.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedReading.notes}</p>
                </div>
              )}
              
              {selectedReading.ticketNumber && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Ticket Number</Label>
                  <p className="text-sm font-mono">{selectedReading.ticketNumber}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}