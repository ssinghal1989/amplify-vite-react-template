import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any) => {
  console.log("🔹 VerifyAuthChallengeResponse event:", JSON.stringify(event, null, 2));

  const expectedOtp = event.request.privateChallengeParameters?.otp;
  const userAnswer = event.request.challengeAnswer;

  console.log("Expected OTP:", expectedOtp, "User answer:", userAnswer);

  event.response.answerCorrect = userAnswer === expectedOtp;

  return event;
};
