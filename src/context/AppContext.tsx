import { GetCurrentUserOutput } from "aws-amplify/auth";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { client, LocalSchema } from "../amplifyClient";
import { getCompanyNameFromDomain, getDomainFromEmail } from "../utils/common";

export interface UserData {
  name: string;
  email: string;
  companyName: string;
  jobTitle: string;
}

export type LOGIN_NEXT_STEP = "CONFIRM_SIGNUP" | "CONFIRM_SIGNIN";

export interface AppState {
  // User data
  userData: LocalSchema["User"]["type"] | null;
  userFormData: UserData | null;
  loginEmail: string;
  loggedInUserDetails: GetCurrentUserOutput | null;

  // Company data
  company: LocalSchema["Company"]["type"] | null;

  // Login next step
  loginNextStep: LOGIN_NEXT_STEP;

  // Assessment data
  tier1Score: number;
  tier1Responses: Record<string, string>;

  // UI state
  sidebarCollapsed: boolean;

  // User loginflow
  loginFlow: "DIRECT" | "VIA_ASSESSMENT" | null;
  redirectPathAfterLogin?: string;
}

export type AppAction =
  | { type: "SET_USER_DATA"; payload: LocalSchema["User"]["type"] | null }
  | { type: "SET_COMPANY_DATA"; payload: LocalSchema["Company"]["type"] | null }
  | {
      type: "SET_USER_FORM_DATA";
      payload: UserData | null;
    }
  | { type: "SET_LOGIN_EMAIL"; payload: string }
  | { type: "SET_TIER1_SCORE"; payload: number }
  | { type: "SET_TIER1_RESPONSES"; payload: Record<string, string> }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "LOGIN_NEXT_STEP"; payload: LOGIN_NEXT_STEP }
  | { type: "SET_LOGGED_IN_USER_DETAILS"; payload: GetCurrentUserOutput | null }
  | { type: "SET_LOGIN_FLOW"; payload: "DIRECT" | "VIA_ASSESSMENT" | null }
  | { type: "SET_REDIRECT_PATH_AFTER_LOGIN"; payload: string | undefined }
  | { type: "RESET_STATE" };

const initialState: AppState = {
  userData: null,
  company: null,
  userFormData: null,
  loginEmail: "",
  tier1Score: 78,
  tier1Responses: {},
  sidebarCollapsed: false,
  loginNextStep: "CONFIRM_SIGNUP",
  loggedInUserDetails: null,
  loginFlow: null,
  redirectPathAfterLogin: undefined,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER_DATA":
      return { ...state, userData: action.payload };
    case "SET_COMPANY_DATA":
      return { ...state, company: action.payload };
    case "SET_USER_FORM_DATA":
      return { ...state, userFormData: action.payload };
    case "SET_LOGIN_EMAIL":
      return { ...state, loginEmail: action.payload };
    case "SET_TIER1_SCORE":
      return { ...state, tier1Score: action.payload };
    case "SET_TIER1_RESPONSES":
      return { ...state, tier1Responses: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "LOGIN_NEXT_STEP":
      return { ...state, loginNextStep: action.payload };
    case "SET_LOGGED_IN_USER_DETAILS":
      return { ...state, loggedInUserDetails: action.payload };
    case "SET_LOGIN_FLOW":
      return { ...state, loginFlow: action.payload };
    case "SET_REDIRECT_PATH_AFTER_LOGIN":
      return { ...state, redirectPathAfterLogin: action.payload };
    case "RESET_STATE":
      return { ...initialState };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setUserData = async () => {
    let { data: user, errors } = await client.models.User.get({
      id: state.loggedInUserDetails!.userId,
    });
    const loggedInUserDetails = state.loggedInUserDetails;
    if (!user && !errors && loggedInUserDetails) {
      // If user data not found create a new user entry
      const { data } = await client.models.User.create({
        id: loggedInUserDetails?.userId,
        email: loggedInUserDetails?.signInDetails?.loginId!,
      });
      user = data;

      let companyData = null;
      const companyDomain = getDomainFromEmail(
        loggedInUserDetails?.signInDetails?.loginId || ""
      );
      // Try to find a company with the user's email domain
      const { data: _data } = await client.models.Company.list({
        filter: { primaryDomain: { eq: companyDomain! } },
      });
      companyData = _data;
      // If no company exists for the user's domain, create one
      if (!companyData.length) {
        const response = await client.models.Company.create({
          primaryDomain: companyDomain!,
          name: getCompanyNameFromDomain(companyDomain!) || "",
        });
        companyData = response?.data;
      } else {
        companyData = companyData[0];
      }
      if (user && !user.companyId && companyData) {
        const response = await client.models.User.update({
          id: user.id,
          companyId: companyData.id,
        });
        user = response?.data;
      }
      const company = await user?.company();
      dispatch({ type: "SET_USER_DATA", payload: user });
      dispatch({ type: "SET_COMPANY_DATA", payload: company?.data || null });
    } else {
      dispatch({ type: "SET_USER_DATA", payload: user });
    }
  };
  useEffect(() => {
    if (state.loggedInUserDetails) {
      //setUserData();
    } else {
      dispatch({ type: "SET_USER_DATA", payload: null });
    }
  }, [state.loggedInUserDetails]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function useHasCompleteProfile(): boolean {
  const { state } = useAppContext();
  const { userData, company } = state;

  return Boolean(
    userData &&
      company &&
      userData.name &&
      userData.email &&
      userData.jobTitle &&
      company.name &&
      company.primaryDomain
  );
}
