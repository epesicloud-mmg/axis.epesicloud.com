import { Link, useLocation } from "wouter";
import { 
  Gauge, 
  Truck, 
  ClipboardCheck, 
  Scale, 
  ServerCog, 
  Warehouse, 
  Send, 
  ShoppingCart, 
  Calculator,
  BarChart3,
  FileText,
  Users,
  Settings,
  Wheat
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Gauge,
    current: true
  }
];

const operations = [
  {
    name: "Delivery Tracking",
    href: "/delivery-tracking",
    icon: Truck
  },
  {
    name: "Quality Control",
    href: "/quality-control", 
    icon: ClipboardCheck
  },
  {
    name: "Weighbridge",
    href: "/weighbridge",
    icon: Scale
  },
  {
    name: "Production Orders",
    href: "/production-orders",
    icon: ServerCog
  },
  {
    name: "Warehouse",
    href: "/warehouse",
    icon: Warehouse
  },
  {
    name: "Dispatch",
    href: "/dispatch",
    icon: Send
  }
];

const financial = [
  {
    name: "Procurement",
    href: "/procurement",
    icon: ShoppingCart
  },
  {
    name: "Accounts & Billing",
    href: "/accounts",
    icon: Calculator
  }
];

const reports = [
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText
  }
];

const system = [
  {
    name: "User Management",
    href: "/users",
    icon: Users
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-2">
          {/* Dashboard */}
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  isActive(item.href)
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                )}
              >
                <item.icon 
                  className={cn(
                    isActive(item.href)
                      ? "text-primary-500"
                      : "text-gray-400",
                    "mr-3 h-5 w-5"
                  )}
                />
                {item.name}
              </a>
            </Link>
          ))}
          
          {/* Operations */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Operations
            </div>
            {operations.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                  )}
                >
                  <item.icon 
                    className={cn(
                      isActive(item.href)
                        ? "text-primary-500"
                        : "text-gray-400",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          
          {/* Financial */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Financial
            </div>
            {financial.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                  )}
                >
                  <item.icon 
                    className={cn(
                      isActive(item.href)
                        ? "text-primary-500"
                        : "text-gray-400",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          
          {/* Reports */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Reports
            </div>
            {reports.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                  )}
                >
                  <item.icon 
                    className={cn(
                      isActive(item.href)
                        ? "text-primary-500"
                        : "text-gray-400",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          
          {/* System */}
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              System
            </div>
            {system.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50",
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg"
                  )}
                >
                  <item.icon 
                    className={cn(
                      isActive(item.href)
                        ? "text-primary-500"
                        : "text-gray-400",
                      "mr-3 h-5 w-5"
                    )}
                  />
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
