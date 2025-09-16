// Custom hook to handle authentication flow using Amplify
import { useState, useCallback } from "react";
import { signIn, signUp } from "aws-amplify/auth";
import { client } from "../amplifyClient";
import { checkIfUserExists } from "../utils/checkUserExistance";

// Define possible next steps in the login process
export type LOGIN_NEXT_STEP = "CONFIRM_SIGNIN" | "CONFIRM_SIGNUP";

// useAuthFlow manages the authentication process and error state
export function useAuthFlow(
  updateStateAndNavigateToOtp: (step: LOGIN_NEXT_STEP) => void
) {
  // State to store any authentication error messages
  const [error, setError] = useState<string | null>(null);

  // Handles the authentication logic for a given email
  const handleAuth = useCallback(
    async (email: string) => {
      const userExists = await checkIfUserExists(email);
      if (!userExists) {
        try {
          // Attempt to sign up the user as it seems they don't exist
          const signUpResponse = await signUp({
            username: email,
            password: "Temp@123",
            options: { userAttributes: { email } },
          });
          console.log("Sign-up response:", signUpResponse);
          updateStateAndNavigateToOtp("CONFIRM_SIGNUP");
        } catch (signupErr: any) {
          setError(signupErr.message);
        }
        return;
      }
      try {
        // Attempt to sign in with the provided email using email OTP flow
        const signedInResponse: any = await signIn({
          username: email,
          options: {
            authFlowType: "USER_AUTH",
            preferredChallenge: "EMAIL_OTP",
          },
        });

        const { isSignedIn, nextStep } = signedInResponse;

        console.log("Sign-in response:", signedInResponse);
        // If not signed in and next step is to confirm sign in with email code
        if (
          !isSignedIn &&
          nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE"
        ) {
          updateStateAndNavigateToOtp("CONFIRM_SIGNIN");
          // If not signed in and next step is to continue sign in with first factor selection
        } else if (
          !isSignedIn &&
          nextStep.signInStep === "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION"
        ) {
          try {
            // Attempt to sign up the user as it seems they don't exist
            const signUpResponse = await signUp({
              username: email,
              password: "Temp@123",
              options: { userAttributes: { email } },
            });
            console.log("Sign-up response:", signUpResponse);
            updateStateAndNavigateToOtp("CONFIRM_SIGNUP");
          } catch (signupErr: any) {
            setError(signupErr.message);
          }
        }
      } catch (err: any) {
        // Handle and store any errors during sign in or sign up
        console.error(err);
        setError(err.message);
      }
    },
    [updateStateAndNavigateToOtp]
  );

  // Return the authentication handler and error state
  return { handleAuth, error };
}
