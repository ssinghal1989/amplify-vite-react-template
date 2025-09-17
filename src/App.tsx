import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AppProvider,
  useAppContext,
  useHasCompleteProfile,
  UserData,
} from "./context/AppContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { Tier1Assessment } from "./components/Tier1Assessment";
import { Tier2Assessment } from "./components/Tier2Assessment";
import { LoginPage } from "./components/LoginPage";
import { OtpVerificationPage } from "./components/OtpVerificationPage";
import { EmailLoginModal } from "./components/EmailLoginModal";
import { Tier1Results } from "./components/Tier1Results";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useSetUserData } from "./hooks/setUserData";
import { client } from "./amplifyClient";

interface AssessmentData {
  focusAreas: string[];
  maturityLevels: string[];
  gridData: Record<string, Record<string, string>>;
}

function AppContent() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCompleteProfile = useHasCompleteProfile();
  const { setUserData } = useSetUserData();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null
  );

  const checkIfUserAlreadyLoggedIn = async () => {
    const currentUser = await getCurrentUser();

    if (currentUser) {
      dispatch({ type: "SET_LOGGED_IN_USER_DETAILS", payload: currentUser });
      setUserData({ loggedInUserDetails: currentUser! });

      const { data } = await client.queries.getAssessmentData();

      if (data && data.focusAreas && data.maturityLevels && data.gridData) {
        setAssessmentData({
          focusAreas: data.focusAreas,
          maturityLevels: data.maturityLevels,
          gridData: JSON.parse(JSON.parse(data.gridData as unknown as string)),
        } as AssessmentData);
      }
    }
  };

  const fetchTier1Assessment = async () => {
    const { data, errors } = await client.queries.getAssessmentData({
      authMode: "userPool",
    });
    console.log("Fetched assessment data:", data);
    console.log("Errors fetching assessment data:", errors);

    if (data && data.focusAreas && data.maturityLevels && data.gridData) {
      setAssessmentData({
        focusAreas: data.focusAreas,
        maturityLevels: data.maturityLevels,
        gridData: JSON.parse(JSON.parse(data.gridData as unknown as string)),
      } as AssessmentData);
    }
  };

  useEffect(() => {
    if (state.loggedInUserDetails?.signInDetails?.loginId) {
      fetchTier1Assessment();
    }
  }, [state.loggedInUserDetails?.signInDetails?.loginId]);

  useEffect(() => {
    checkIfUserAlreadyLoggedIn();
  }, []);

  const getCurrentView = (): "home" | "tier1" | "tier2" => {
    const path = location.pathname;
    if (path === "/tier1") return "tier1";
    if (path === "/tier2") return "tier2";
    return "home";
  };

  const navigateToTier = (tier: "tier1" | "tier2") => {
    navigate(`/${tier}`);
  };

  const navigateHome = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const handleLogin = (data: UserData) => {
    navigate("/otp");
  };

  const handleOtpVerification = () => {
    dispatch({ type: "SET_LOGIN_EMAIL", payload: "" });
    if (state.redirectPathAfterLogin?.includes("tier1")) {
      // Handle to redirect on result page
      navigate("/tier1-results");
    } else if (state.redirectPathAfterLogin?.includes("tier2")) {
      // Handle to redirect on result page
      navigate("/tier2-results");
    } else {
      navigate("/");
    }
    dispatch({ type: "SET_REDIRECT_PATH_AFTER_LOGIN", payload: undefined });
  };

  const handleLogout = async () => {
    await signOut();
    dispatch({ type: "RESET_STATE" });
    navigate("/");
  };

  const handleHeaderLogin = () => {
    // get the current path to redirect after login
    dispatch({
      type: "SET_REDIRECT_PATH_AFTER_LOGIN",
      payload: location.pathname,
    });
    navigate("/email-login");
  };

  const handleEmailSubmit = (email: string) => {
    dispatch({ type: "SET_LOGIN_EMAIL", payload: email });
    navigate("/otp-login");
  };

  const handleLoginOtpVerification = () => {
    dispatch({ type: "SET_LOGIN_EMAIL", payload: "" });
    navigate(state.redirectPathAfterLogin || "/");
    dispatch({ type: "SET_REDIRECT_PATH_AFTER_LOGIN", payload: undefined });
  };

  const handleScheduleCall = () => {
    // In a real app, this would open a calendar booking system
    alert("Calendar booking system would open here");
  };

  const handleRetakeAssessment = () => {
    navigate("/tier1");
  };

  const handleTier1Complete = (responses: Record<string, string>) => {
    console.log("Tier 1 assessment completed with responses:", responses);
    dispatch({ type: "SET_TIER1_RESPONSES", payload: responses });
    // Calculate score based on responses (simplified calculation)
    const score = Math.floor(Math.random() * 40) + 60; // Demo: random score between 60-100
    dispatch({ type: "SET_TIER1_SCORE", payload: score });
    if (hasCompleteProfile) {
      navigate("/tier1-results");
    } else {
      dispatch({
        type: "SET_REDIRECT_PATH_AFTER_LOGIN",
        payload: "/tier1-results",
      });
      navigate("/login");
    }
  };

  console.log("App State:", state);
  return (
    <Layout
      currentView={getCurrentView()}
      sidebarCollapsed={state.sidebarCollapsed}
      toggleSidebar={toggleSidebar}
      onNavigateHome={navigateHome}
      onNavigateToTier={navigateToTier}
      onLogin={handleHeaderLogin}
      onLogout={handleLogout}
      userName={state.userData?.name || state.userData?.email || ""}
    >
      <Routes>
        <Route
          path="/"
          element={<HomePage onNavigateToTier={navigateToTier} />}
        />
        <Route
          path="/tier1"
          element={
            assessmentData ? (
              <Tier1Assessment
                onComplete={handleTier1Complete}
                assessmentData={assessmentData!}
              />
            ) : null
          }
        />
        <Route
          path="/tier2"
          element={
            <Tier2Assessment
              onNavigateToTier={navigateToTier}
              onShowLogin={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage onLogin={handleLogin} onCancel={() => navigate("/")} />
          }
        />
        <Route
          path="/otp"
          element={
            <OtpVerificationPage
              userEmail={state.loginEmail}
              onVerify={handleOtpVerification}
              onCancel={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/tier1-results"
          element={
            <Tier1Results
              score={state.tier1Score}
              onNavigateToTier2={() => navigate("/tier2")}
              onScheduleCall={handleScheduleCall}
              onRetakeAssessment={handleRetakeAssessment}
            />
          }
        />
        <Route
          path="/email-login"
          element={
            <EmailLoginModal
              onCancel={() => {
                navigate(`${state.redirectPathAfterLogin}` || "/");
                dispatch({
                  type: "SET_REDIRECT_PATH_AFTER_LOGIN",
                  payload: undefined,
                });
              }}
            />
          }
        />
        {/* OTP verification route for direct login flow */}
        <Route
          path="/otp-login"
          element={
            <OtpVerificationPage
              userEmail={state.loginEmail}
              onVerify={handleLoginOtpVerification}
              onCancel={() => navigate("/email-login")}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
