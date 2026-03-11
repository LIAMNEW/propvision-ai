import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, TrendingDown, Home, BarChart3, MapPin, Info, AlertTriangle, AlertCircle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "../components/shared/EmptyState";

const TYPE_CONFIG = {
  price_drop:     { icon: TrendingDown, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  new_listing:    { icon: Home, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  yield_change:   { icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  market_update:  { icon: Info, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  suburb_alert:   { icon: MapPin, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

const SEVERITY_CONFIG = {
  info:     { icon: Info, dot: "bg-blue-400" },
  warning:  { icon: AlertTriangle, dot: "bg-amber-400" },
  critical: { icon: AlertCircle, dot: "bg-red-400" },
};

export default function Alerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.MarketAlert.list("-created_date", 50),
  });

  const markReadMutation = useMutation({
    mutationFn: (alert) => base44.entities.MarketAlert.update(alert.id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.06] rounded w-2/3" />
                <div className="h-3 bg-white/[0.04] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Market alerts and notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const typeConf = TYPE_CONFIG[alert.alert_type] || TYPE_CONFIG.market_update;
            const sevConf = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            const Icon = typeConf.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`glass-card rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 ${
                  !alert.is_read ? "border-l-2 border-l-indigo-500" : ""
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${typeConf.bg} border ${typeConf.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${typeConf.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${!alert.is_read ? "text-white" : "text-gray-400"}`}>
                      {alert.title}
                    </h3>
                    {!alert.is_read && <div className={`w-1.5 h-1.5 rounded-full ${sevConf.dot}`} />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {alert.related_suburb && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {alert.related_suburb}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
                      {alert.created_date ? format(new Date(alert.created_date), "MMM d, h:mm a") : ""}
                    </span>
                  </div>
                </div>

                {/* Mark read */}
                {!alert.is_read && (
                  <button
                    onClick={() => markReadMutation.mutate(alert)}
                    className="shrink-0 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}