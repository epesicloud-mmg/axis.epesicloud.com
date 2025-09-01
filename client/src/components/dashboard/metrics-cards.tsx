import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Award, Clock, Package } from "lucide-react";

type DashboardMetrics = {
  dailyProduction: number;
  qualityScore: number;
  pendingOrders: number;
  inventoryLevel: number;
};

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Production</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatNumber(metrics?.dailyProduction || 0)} kg
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>12% vs yesterday</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(metrics?.qualityScore || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Award className="h-3 w-3 mr-1" />
                <span>Above target</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.pendingOrders || 0}
              </p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>3 urgent</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory Level</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(metrics?.inventoryLevel || 0).toFixed(0)}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <Package className="h-3 w-3 mr-1" />
                <span>Optimal</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
