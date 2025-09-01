import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, XCircle } from "lucide-react";
import type { QualityCheck } from "@shared/schema";

export default function QualityAlerts() {
  const { data: qualityChecks = [] } = useQuery<QualityCheck[]>({
    queryKey: ["/api/quality-checks"],
    retry: false,
  });

  // Filter for recent failed or problematic quality checks
  const alerts = qualityChecks
    .filter((check) => check.status === "failed" || check.contamination)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">No quality alerts</p>
            <p className="text-xs text-gray-500 mt-1">All quality checks are passing</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex-shrink-0">
                  {alert.status === "failed" ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.status === "failed" ? "Quality Check Failed" : "Quality Issue Detected"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.contamination && "Contamination detected in "}
                    {alert.moistureLevel && `Moisture level: ${alert.moistureLevel}%`}
                    {alert.notes && ` - ${alert.notes}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.checkedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
