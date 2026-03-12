import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const RISK_OPTIONS = ["Conservative", "Balanced", "Growth-Focused"];
const BUDGET_OPTIONS = ["Under $500K", "$500K-$800K", "$800K-$1.5M", "$1.5M+"];
const FREQ_OPTIONS = ["Instant", "Daily", "Weekly"];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [notifs, setNotifs] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setPrefs({
        risk_appetite: u.risk_appetite || "Balanced",
        preferred_states: u.preferred_states || [],
        budget_range: u.budget_range || "Under $500K",
      });
      setNotifs({
        telegram: u.notifications_telegram || false,
        telegram_chat_id: u.telegram_chat_id || "",
        whatsapp: u.notifications_whatsapp || false,
        whatsapp_number: u.whatsapp_number || "",
        score_changes: u.notify_score_changes !== false,
        price_drops: u.notify_price_drops !== false,
        new_listings: u.notify_new_listings !== false,
        market_updates: u.notify_market_updates !== false,
        frequency: u.notify_frequency || "Instant",
      });
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        risk_appetite: prefs.risk_appetite,
        preferred_states: prefs.preferred_states,
        budget_range: prefs.budget_range,
        notifications_telegram: notifs.telegram,
        telegram_chat_id: notifs.telegram_chat_id,
        notifications_whatsapp: notifs.whatsapp,
        whatsapp_number: notifs.whatsapp_number,
        notify_score_changes: notifs.score_changes,
        notify_price_drops: notifs.price_drops,
        notify_new_listings: notifs.new_listings,
        notify_market_updates: notifs.market_updates,
        notify_frequency: notifs.frequency,
      });
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const toggleState = (state) => {
    const current = prefs.preferred_states || [];
    const newStates = current.includes(state) ? current.filter((s) => s !== state) : [...current, state];
    setPrefs({ ...prefs, preferred_states: newStates });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Investment Preferences */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-base font-semibold text-white mb-4">Investment Preferences</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-400">Risk Appetite</Label>
            <Select value={prefs.risk_appetite} onValueChange={(v) => setPrefs({ ...prefs, risk_appetite: v })}>
              <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                {RISK_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-gray-300 focus:bg-white/[0.06]">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-400 mb-2 block">Preferred States</Label>
            <div className="flex flex-wrap gap-2">
              {STATES.map((state) => (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (prefs.preferred_states || []).includes(state)
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "bg-white/[0.04] text-gray-400 border border-white/[0.08]"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Budget Range</Label>
            <Select value={prefs.budget_range} onValueChange={(v) => setPrefs({ ...prefs, budget_range: v })}>
              <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                {BUDGET_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b} className="text-gray-300 focus:bg-white/[0.06]">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-base font-semibold text-white mb-4">Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Telegram</Label>
            <Switch checked={notifs.telegram} onCheckedChange={(v) => setNotifs({ ...notifs, telegram: v })} />
          </div>
          {notifs.telegram && (
            <Input
              value={notifs.telegram_chat_id}
              onChange={(e) => setNotifs({ ...notifs, telegram_chat_id: e.target.value })}
              placeholder="Chat ID"
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">WhatsApp</Label>
            <Switch checked={notifs.whatsapp} onCheckedChange={(v) => setNotifs({ ...notifs, whatsapp: v })} />
          </div>
          {notifs.whatsapp && (
            <Input
              value={notifs.whatsapp_number}
              onChange={(e) => setNotifs({ ...notifs, whatsapp_number: e.target.value })}
              placeholder="+61..."
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          )}

          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            {[
              { key: "score_changes", label: "Score Changes" },
              { key: "price_drops", label: "Price Drops" },
              { key: "new_listings", label: "New Listings" },
              { key: "market_updates", label: "Market Updates" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label className="text-sm text-gray-400">{item.label}</Label>
                <Switch
                  checked={notifs[item.key]}
                  onCheckedChange={(v) => setNotifs({ ...notifs, [item.key]: v })}
                />
              </div>
            ))}
          </div>

          <div>
            <Label className="text-xs text-gray-400">Frequency</Label>
            <Select value={notifs.frequency} onValueChange={(v) => setNotifs({ ...notifs, frequency: v })}>
              <SelectTrigger className="mt-1 bg-white/[0.04] border-white/[0.08] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1223] border-white/[0.08]">
                {FREQ_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="text-gray-300 focus:bg-white/[0.06]">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(13,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-base font-semibold text-white mb-4">Account</h2>
        <p className="text-sm text-gray-400">{user.email}</p>
      </div>

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || saved}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Saved
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}