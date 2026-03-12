import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, TrendingDown, Home, BarChart3, MapPin, Info, Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const TYPE_ICONS = {
  price_drop: TrendingDown,
  new_listing: Home,
  yield_change: BarChart3,
  market_update: Info,
  suburb_alert: MapPin,
};

export default function Alerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.MarketAlert.list("-created_date", 100),
  });

  const markReadMutation = useMutation({
    mutationFn: (alert) => base44.entities.MarketAlert.update(alert.id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = alerts.filter((a) => !a.is_read);
      await Promise.all(unread.map((a) => base44.entities.MarketAlert.update(a.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All caught up"}
        </p>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            variant="outline"
            size="sm"
            className="bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]"
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse flex gap-4" style={{ background: "rgba(13,18,35,0.9)" }}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.06] rounded w-2/3" />
                <div className="h-3 bg-white/[0.04] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Bell className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-300">No alerts yet</h3>
          <p className="text-sm text-gray-500 mt-1">Market alerts will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = TYPE_ICONS[alert.alert_type] || Info;
            return (
              <div
                key={alert.id}
                className={`rounded-2xl p-5 flex items-start gap-4 ${
                  !alert.is_read ? "border-l-2 border-l-indigo-500" : ""
                }`}
                style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${!alert.is_read ? "text-white" : "text-gray-400"}`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {alert.related_suburb && (
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {alert.related_suburb}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600">
                      {alert.created_date && format(new Date(alert.created_date), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>

                {!alert.is_read && (
                  <button
                    onClick={() => markReadMutation.mutate(alert)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}