import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wheat, Truck, ClipboardCheck, ServerCog, Warehouse, Send } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wheat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-medium text-gray-900">Maize Production System</h1>
            </div>
            <Button onClick={handleLogin} size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Comprehensive Maize Flour Production Management
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Streamline your entire production workflow from raw maize delivery to finished product dispatch
            with our integrated SaaS platform designed for flour production facilities.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Complete Production Workflow Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Delivery Tracking</CardTitle>
                <CardDescription>
                  Track truck deliveries, manage supplier information, and handle weighbridge operations
                  with integrated ticket generation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Quality Control</CardTitle>
                <CardDescription>
                  Comprehensive quality checks with batch tracking, moisture level monitoring,
                  and automated quality score calculations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <ServerCog className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Production Management</CardTitle>
                <CardDescription>
                  Plan and monitor production orders, track progress in real-time,
                  and manage batch numbers for full traceability.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Warehouse className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Warehouse Management</CardTitle>
                <CardDescription>
                  Track inventory levels, manage stock movements, and maintain optimal
                  storage conditions for raw materials and finished products.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Dispatch & Delivery</CardTitle>
                <CardDescription>
                  Schedule dispatches, track delivery status, and manage customer orders
                  with integrated logistics support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure access control for different teams including Quality Control,
                  Production, Warehouse, Procurement, and Dispatch teams.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Production Process?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join leading flour production facilities that trust our platform
            to manage their complete workflow from delivery to dispatch.
          </p>
          <Button onClick={handleLogin} size="lg" variant="secondary">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Maize Production Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
