import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { useAuth } from '../contexts/useAuth';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signin, signout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showNewUserBanner, setShowNewUserBanner] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'care_partner' | 'clinician' | ''>('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard against double submission
    if (isLoading) return;

    const newErrors: { email?: string; password?: string; role?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (!selectedRole) {
      newErrors.role = 'Please select your role to continue';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setErrors({});

    try {
      const signedInUser = await signin(email.trim(), password);

      if (signedInUser.role !== selectedRole) {
        const roleLabelMap = {
          patient: 'Patient',
          care_partner: 'Caregiver / Care Partner',
          clinician: 'Clinician',
        } as const;

        setErrors({
          role: `This account is registered as "${roleLabelMap[signedInUser.role]}". Please select that role and try again.`,
        });

        // Sign out in background — do not await (prevents UI freeze on slow network)
        signout(false).catch(() => {});
        return;
      }

      if (rememberMe) {
        localStorage.setItem('remembered_email', email.trim());
      } else {
        localStorage.removeItem('remembered_email');
      }

      const dashboardMap: Record<string, string> = {
        patient: '/patient/dashboard',
        care_partner: '/caregiver',
        caregiver: '/caregiver',
        clinician: '/clinician',
      };

      navigate(dashboardMap[signedInUser.role] ?? '/');
    } catch (error: any) {
      const message = (error?.message || 'Sign in failed. Please try again.').trim();

      if (message.toLowerCase().includes('role')) {
        setErrors({ role: message });
      } else if (
        message.toLowerCase().includes('password') ||
        message.toLowerCase().includes('credentials') ||
        message.toLowerCase().includes('login')
      ) {
        setErrors({ password: message });
      } else {
        setErrors({ email: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 mb-4 hover:bg-white transition-colors"
          aria-label="Back to Home"
        >
          <ArrowLeft size={18} color="#7200CA" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Back to Home</span>
        </button>
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-[#101828] mb-3">
              Welcome Back
            </h1>
            <p className="text-lg" style={{ color: '#6b7280' }}>
              Sign in to continue your sleep intervention program
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            {/* New User Info Banner */}
            {showNewUserBanner && (
              <div className="mb-6 p-4 bg-[#6D28D9]/8 border border-[#6D28D9]/25 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#6D28D9] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#5B21B6]">
                    <strong>New to PRESERVE?</strong> Click "Create Account" below to get started with your personalized sleep intervention program.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewUserBanner(false)}
                  className="text-[#6D28D9] hover:text-[#5B21B6] transition-colors p-0.5"
                  aria-label="Dismiss new user message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                  className={`h-14 px-4 rounded-xl border-2 text-base ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-[#6D28D9] focus:bg-white transition-colors`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                    className={`h-14 px-4 pr-12 rounded-xl border-2 text-base ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:border-[#6D28D9] focus:bg-white transition-colors`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-base">
                  I am a
                </Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => { setSelectedRole(e.target.value as 'patient' | 'care_partner' | 'clinician' | ''); clearFieldError('role'); }}
                  className={`w-full h-14 px-4 rounded-xl border-2 text-base ${
                    errors.role ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:border-[#6D28D9] focus:bg-white transition-colors`}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                >
                  <option value="">Select your role...</option>
                  <option value="patient">Patient</option>
                  <option value="care_partner">Caregiver/Care Partner</option>
                  <option value="clinician">Clinician</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="text-sm text-red-600 mt-1">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="w-5 h-5 rounded border-2 border-gray-300"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-base cursor-pointer"
                    style={{ color: '#4b5563' }}
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-base hover:underline transition-colors"
                  style={{ color: '#6D28D9' }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Create Account Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-xl text-lg border-2 border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9]/10 transition-all"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </form>
          </div>
      </div>
    </div>
  );
}