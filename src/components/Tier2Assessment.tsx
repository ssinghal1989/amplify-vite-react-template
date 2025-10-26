import React, { useState, useEffect } from "react";
import { useAppContext, useHasTier2Access } from "../context/AppContext";
import { Tier2AssessmentSchedule } from "./Tier2AssessmentSchedule";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Tier2AssessmentInfo } from "./Tier2AssessmentInfo";
import { Tier2AssessmentQuestions } from "./Tier2AssessmentQuestions";
import { useCallRequest } from "../hooks/useCallRequest";
import { Loader } from "./ui/Loader";

interface Tier2AssessmentProps {
  onNavigateToTier: (tier: "tier1" | "tier2") => void;
}

export function Tier2Assessment({ onNavigateToTier }: Tier2AssessmentProps) {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"info" | "questions" | "schedule">("info");
  const [isLoading, setIsLoading] = useState(true);
  const hasTier2Access = useHasTier2Access();
  const { tier2AssessmentRequests } = useCallRequest();

  const handleStartAssessment = () => {
    setCurrentStep("questions");
  };

  const handleNavigateToSchedule = () => {
    setCurrentStep("schedule");
  };

  const handleCompleteAssessment = (responses: Record<string, string>) => {
    // Handle Tier 2 assessment completion
  };

  const isUserLoggedIn = !!state.loggedInUserDetails?.signInDetails?.loginId;
  const hasRequestedTier2 = tier2AssessmentRequests.length > 0;

  useEffect(() => {
    if (isUserLoggedIn && state.userData) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [isUserLoggedIn, state.userData, tier2AssessmentRequests]);

  // Show loader while checking user status
  if (isLoading && isUserLoggedIn) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <Loader text="Loading assessment..." size="lg" />
          </div>
        </div>
      </main>
    );
  }

  // User is NOT logged in - show schedule page
  if (!isUserLoggedIn) {
    return <Tier2AssessmentSchedule onBack={() => onNavigateToTier("tier1")} />;
  }

  // User IS logged in but has NOT requested Tier 2 - show schedule page
  if (isUserLoggedIn && !hasRequestedTier2) {
    return <Tier2AssessmentSchedule onBack={() => onNavigateToTier("tier1")} />;
  }

  // User IS logged in AND has requested Tier 2 but NO access - show access required
  if (isUserLoggedIn && hasRequestedTier2 && !hasTier2Access) {
    return (
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Access Required
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Tier 2 assessment access has not been enabled for your organization.
            </p>
            <button
              onClick={() => onNavigateToTier("tier1")}
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
            >
              Back to Tier 1
            </button>
          </div>
        </div>
      </main>
    );
  }

  // User IS logged in AND has requested Tier 2 AND has access - show assessment flow
  switch (currentStep) {
    case "info":
      return (
        <Tier2AssessmentInfo
          onStartAssessment={handleStartAssessment}
          onNavigateToSchedule={handleNavigateToSchedule}
        />
      );
    case "questions":
      return (
        <Tier2AssessmentQuestions
          onComplete={handleCompleteAssessment}
          onBack={() => setCurrentStep("info")}
        />
      );
    case "schedule":
      return (
        <Tier2AssessmentSchedule onBack={() => setCurrentStep("info")} />
      );
    default:
      return (
        <Tier2AssessmentInfo
          onStartAssessment={handleStartAssessment}
          onNavigateToSchedule={handleNavigateToSchedule}
        />
      );
  }
}
