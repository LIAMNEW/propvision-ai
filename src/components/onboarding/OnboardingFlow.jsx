import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    title: "What describes you best?",
    options: ["Investor", "First-Time", "Buyer's Agent"],
    field: "investor_role",
  },
  {
    title: "What's your budget range?",
    options: ["Under $500K", "$500K-$800K", "$800K-$1.5M", "$1.5M+"],
    field: "budget_range",
  },
  {
    title: "Which states interest you?",
    options: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
    field: "preferred_states",
    multi: true,
  },
  {
    title: "What's your risk appetite?",
    options: ["Conservative", "Balanced", "Growth-Focused"],
    field: "risk_appetite",
  },
];

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];
  const isMulti = currentStep.multi;
  const selected = data[currentStep.field] || (isMulti ? [] : null);

  const handleSelect = (option) => {
    if (isMulti) {
      const current = data[currentStep.field] || [];
      const newVal = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setData({ ...data, [currentStep.field]: newVal });
    } else {
      setData({ ...data, [currentStep.field]: option });
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await base44.auth.updateMe({ ...data, onboarding_complete: true });
        onComplete();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  const canProceed = isMulti ? selected.length > 0 : selected !== null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#050810" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{
            background: "rgba(13,18,35,0.9)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-indigo-500" : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
          <p className="text-sm text-gray-400 mb-8">
            Step {step + 1} of {STEPS.length}
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {currentStep.options.map((option) => {
              const isSelected = isMulti ? selected.includes(option) : selected === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    p-4 rounded-xl text-sm font-medium transition-all
                    ${isSelected
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                      : "bg-white/[0.03] border-white/[0.08] text-gray-300 hover:bg-white/[0.06]"
                    }
                  `}
                  style={{ border: "1px solid" }}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
          >
            {loading ? "Setting up..." : step === STEPS.length - 1 ? "Get Started" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}