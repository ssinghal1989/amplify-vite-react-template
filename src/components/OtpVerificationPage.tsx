import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';

interface OtpVerificationPageProps {
  userEmail: string;
  onVerify: () => void;
  onCancel: () => void;
}

export function OtpVerificationPage({ userEmail, onVerify, onCancel }: OtpVerificationPageProps) {
  const [otp, setOtp] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      // Simulate OTP verification - in real app, this would call an API
      onVerify();
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResending(false);
    setCountdown(60);
    setCanResend(false);
    setOtp('');
  };

  const isOtpValid = otp.length === 6;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-gray-900 font-medium mt-1">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              className="block w-full px-4 py-4 text-center text-2xl font-mono border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={!isOtpValid}
            className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              isOtpValid
                ? 'bg-primary text-white hover:opacity-90 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <span>Verify & See Results</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend Code</span>
                  </>
                )}
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200"
          >
            Back to User Information
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder or try resending
          </p>
        </div>
      </div>
    </div>
  );
}