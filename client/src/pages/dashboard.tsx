import { useItems } from "@/hooks/use-items";
import { ItemDialog } from "@/components/item-dialog";
import { StatusBadge } from "@/components/status-badge";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";
import { Loader2, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: items, isLoading, error } = useItems();

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }

  if (!items) return null;

  // Compute stats
  const total = items.length;
  const completed = items.filter(i => i.status === "completed").length;
  const pending = items.filter(i => i.status === "pending").length;
  const failed = items.filter(i => i.status === "failed").length;

  const chartData = [
    { name: "Completed", value: completed, color: "#22c55e" },
    { name: "Pending", value: pending, color: "#eab308" },
    { name: "Failed", value: failed, color: "#ef4444" },
  ];

  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">Real-time harvesting metrics and system status.</p>
        </div>
        <ItemDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: total, icon: DatabaseIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "In Queue", value: pending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Failed", value: failed, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="dashboard-card flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="dashboard-card h-[400px] flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-6">Status Distribution</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="dashboard-card h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {recentItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No items yet.</p>
            ) : (
              recentItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    item.status === 'completed' ? 'bg-green-500' : 
                    item.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{item.sourceUrl}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
