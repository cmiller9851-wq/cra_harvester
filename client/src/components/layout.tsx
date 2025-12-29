import { Link, useLocation } from "wouter";
import { LayoutDashboard, Database, Activity, Settings, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Harvested Items", href: "/items", icon: Database },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-card/30 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Hexagon className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">CRA Harvester</h1>
            <p className="text-xs text-muted-foreground font-mono">v1.0.0-beta</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>Node 01</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-1.5 mt-2">
                <div className="bg-primary w-[75%] h-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center px-4 bg-card/30 backdrop-blur-md sticky top-0 z-50">
           <Hexagon className="w-6 h-6 text-primary mr-3" />
           <span className="font-bold">CRA Harvester</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
