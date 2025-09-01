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
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <ClipboardCheck className="w-4 h-4 text-gray-600" />;
    }
  };

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Quality Control</h2>
                <p className="text-gray-600">Manage quality checks and maintain product standards</p>
              </div>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quality Check
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Conduct Quality Check</DialogTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Checks</p>
                      <p className="text-2xl font-semibold text-gray-900">{qualityChecks.length}</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passed</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {qualityChecks.filter((check: any) => check.status === "passed").length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-semibold text-red-600">
                        {qualityChecks.filter((check: any) => check.status === "failed").length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-yellow-600">
                        {qualityChecks.filter((check: any) => check.status === "pending").length}
                      </p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Checks List */}
            {checksLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading quality checks...</p>
              </div>
            ) : qualityChecks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quality checks found</h3>
                  <p className="text-gray-600 mb-6">Start by conducting your first quality check</p>
                  <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quality Check
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Quality Check History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qualityChecks.map((check: any) => (
                      <div
                        key={check.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(check.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {check.checkType.replace('_', ' ').toUpperCase()} Quality Check
                            </h4>
                            <p className="text-sm text-gray-600">
                              Batch: {check.batchId}
                            </p>
                            {check.moistureLevel && (
                              <p className="text-sm text-gray-600">
                                Moisture Level: {check.moistureLevel}%
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(check.status)}>
                            {check.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(check.checkedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
