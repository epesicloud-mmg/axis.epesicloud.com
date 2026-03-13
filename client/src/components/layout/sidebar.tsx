import { Link, useLocation } from "wouter";
import {
  Gauge,
  Truck,
  ClipboardCheck,
  Scale,
  Cog,
  Warehouse,
  Send,
  ShoppingCart,
  Calculator,
  BarChart3,
  FileText,
  Users,
  Settings,
  Flame,
  AlertTriangle,
  History,
  Archive,
  Package,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const getNavigationByRole = (role: string) => {
  const common = [
    { name: "Dashboard", href: "/", icon: Gauge },
  ];

  const adminItems = [
    { name: "User Management", href: "/users", icon: Users },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Storage Locations", href: "/locations", icon: Warehouse },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
    { name: "Exceptions", href: "/exceptions", icon: AlertTriangle },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const managerItems = [
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Audit Logs", href: "/audit-logs", icon: History },
    { name: "Exceptions", href: "/exceptions", icon: AlertTriangle },
  ];

  const rolesMap: { [key: string]: any[] } = {
    "Admin": [
      ...common,
      ...adminItems,
    ],
    "Plant Manager": [
      ...common,
      ...managerItems,
      { name: "Production Overview", href: "/production/overview", icon: Cog },
      { name: "Inventory", href: "/warehouse", icon: Warehouse },
    ],
    "Procurement": [
      ...common,
      { name: "Suppliers", href: "/suppliers", icon: ShoppingCart },
      { name: "Expected Deliveries", href: "/delivery-tracking", icon: Truck },
    ],
    "Receiving / Gate": [
      ...common,
      { name: "Inbound Trucks", href: "/delivery-tracking", icon: Truck },
      { name: "Raw Material Intake", href: "/receiving/intake", icon: Layers },
    ],
    "Weighbridge Operator": [
      ...common,
      { name: "Weighbridge", href: "/weighbridge", icon: Scale },
    ],
    "Quality Control": [
      ...common,
      { name: "Lab Tests", href: "/quality-control", icon: ClipboardCheck },
      { name: "QC Released", href: "/quality-control/released", icon: Archive },
    ],
    "Warehouse / Inventory": [
      ...common,
      { name: "Stock Levels", href: "/warehouse", icon: Warehouse },
      { name: "Stock Movements", href: "/warehouse/movements", icon: History },
    ],
    "Production Manager": [
      ...common,
      { name: "Production Orders", href: "/production-orders", icon: Cog },
      { name: "BOM Management", href: "/production/bom", icon: Cog },
    ],
    "Production Operator": [
      ...common,
      { name: "My Work Orders", href: "/production/operator", icon: Flame },
      { name: "Material Issues", href: "/production/materials", icon: Layers },
    ],
    "Dispatch": [
      ...common,
      { name: "Dispatch Orders", href: "/dispatch", icon: Send },
      { name: "Pick List", href: "/dispatch/pick", icon: Package },
    ],
  };

  return rolesMap[role] || common;
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = getNavigationByRole(user?.role || "Procurement");

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <span className="text-2xl font-bold text-white tracking-tight">
          AXIS <span className="text-primary-500">PLATFORM</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive(item.href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
              )}
            >
              <item.icon
                className={cn(
                  isActive(item.href)
                    ? "text-primary-500"
                    : "text-slate-500 group-hover:text-slate-300",
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center px-3 py-2 bg-slate-800/50 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
