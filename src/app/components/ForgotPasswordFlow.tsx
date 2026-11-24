import { useEffect, useState } from 'react';
import { Moon, ArrowLeft, Mail, KeyRound, CheckCircle2, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { authAPI } from '../utils/api';
import { supabase } from '../utils/supabaseClient';

type ForgotPasswordStep = 'request' | 'code-sent' | 'reset' | 'success';

export default function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('request');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      setCurrentStep('reset');
      // Clean URL hash so tokens are not left in browser history state.
      window.history.replaceState(null, '', '/forgot-password');
    }
  }, []);

  // Step 1: Request Password Reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await authAPI.resetPassword(email);
        setCurrentStep('code-sent');
      } catch (error: any) {
        setErrors({ email: error?.message || 'Unable to send reset email. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Step 2: Verify Code
  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      // Clear error when user types
      if (errors.verificationCode) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.verificationCode;
          return newErrors;
        });
      }
    }
  };

  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setErrors({ verificationCode: 'Please enter the complete 6-digit code' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });

      if (error) {
        setErrors({ verificationCode: error.message || 'Invalid or expired code.' });
        return;
      }

      setCurrentStep('reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    try {
      await authAPI.resetPassword(email);
      setVerificationCode(['', '', '', '', '', '']);
      setErrors({});
    } catch (error: any) {
      setErrors({ verificationCode: error?.message || 'Unable to resend code. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
          setErrors({ newPassword: error.message || 'Unable to reset password. Please try again.' });
          return;
        }

        setCurrentStep('success');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Step 1: Request Reset
  if (currentStep === 'request') {
    return (
      <div className="nondashboard-ds min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back to Sign In</span>
          </button>

          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-6">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
              Forgot Password?
            </h1>
            <p className="text-lg" style={{ color: '#6b7280' }}>
              No worries! Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>

          {/* Request Form */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.email;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-14 pl-12 pr-4 rounded-xl border-2 text-base ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:border-purple-500 focus:bg-white transition-colors`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-sm" style={{ color: '#0f766e' }}>
                <strong>Need help?</strong> If you don't receive an email within a few minutes, check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Verify Code
  if (currentStep === 'code-sent') {
    return (
      <div className="nondashboard-ds min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => setCurrentStep('request')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </button>

          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
              Check Your Email
            </h1>
            <p className="text-lg mb-2" style={{ color: '#6b7280' }}>
              We've sent a 6-digit verification code to:
            </p>
            <p className="text-lg" style={{ color: '#1f1f3d' }}>
              <strong>{email}</strong>
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base text-center block">
                  Enter Verification Code
                </Label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl rounded-xl border-2 ${
                        errors.verificationCode
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      } focus:border-teal-500 focus:bg-white transition-colors`}
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))}
                </div>
                {errors.verificationCode && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    {errors.verificationCode}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-base mb-2" style={{ color: '#6b7280' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-base text-purple-600 hover:underline transition-colors"
                  disabled={isSubmitting}
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Reset Password
  if (currentStep === 'reset') {
    return (
      <div className="nondashboard-ds min-h-screen bg-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mb-6">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
              Create New Password
            </h1>
            <p className="text-lg" style={{ color: '#6b7280' }}>
              Choose a strong password to protect your account
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-base">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.newPassword;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-14 px-4 pr-12 rounded-xl border-2 text-base ${
                      errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:border-purple-500 focus:bg-white transition-colors`}
                    aria-invalid={!!errors.newPassword}
                    aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <KeyRound className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p id="newPassword-error" className="text-sm text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }
                    }}
                    className={`h-14 px-4 pr-12 rounded-xl border-2 text-base ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    } focus:border-purple-500 focus:bg-white transition-colors`}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <KeyRound className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm mb-3" style={{ color: '#4b5563' }}>
                  <strong>Password Requirements:</strong>
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        newPassword.length >= 8 ? 'text-teal-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm text-gray-600">At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        newPassword && confirmPassword && newPassword === confirmPassword
                          ? 'text-teal-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm text-gray-600">Passwords match</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="nondashboard-ds min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Success Icon and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
            Password Reset Successful!
          </h1>
          <p className="text-lg" style={{ color: '#6b7280' }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm" style={{ color: '#0f766e' }}>
                    <strong>What's Next?</strong>
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#0f766e' }}>
                    Click the button below to return to the sign-in page and access your account with your new password.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm mb-2" style={{ color: '#6b21a8' }}>
                <strong>Security Tips:</strong>
              </p>
              <ul className="space-y-1 text-sm" style={{ color: '#6b21a8' }}>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Don't share your password with anyone</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Use a unique password for this account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="flex-shrink-0">•</span>
                  <span>Enable "Remember Me" on trusted devices only</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/signin')}
              className="w-full h-14 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}