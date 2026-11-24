import { useState } from 'react';
import { UserRound, HandHeart, BriefcaseMedical, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../contexts/useAuth';
import { dataAPI } from '../utils/api';
import { formatPhoneNumber } from '../utils/phone';

type UserRole = 'patient' | 'care_partner' | 'clinician' | null;

interface FormErrors {
  [key: string]: string;
}

// Move InputField component outside to prevent re-creation on each render
const InputField = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helpText,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helpText?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-base">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-14 px-4 rounded-xl border-2 text-base ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
      } focus:border-purple-500 focus:bg-white transition-colors`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
    />
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600">
        {error}
      </p>
    )}
    {helpText && !error && (
      <p id={`${id}-help`} className="text-sm text-gray-500">
        {helpText}
      </p>
    )}
  </div>
);

// Move PasswordField component outside to prevent re-creation on each render
const PasswordField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  show: boolean;
  onToggleShow: () => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-base">
      {label}
      <span className="text-red-500 ml-1">*</span>
    </Label>
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 px-4 pr-12 rounded-xl border-2 text-base ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
        } focus:border-purple-500 focus:bg-white transition-colors`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState<'role-selection' | 'form'>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Common form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile_number: '',
    password: '',
    confirmPassword: '',
    // Patient specific
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalId: '',
    // Care Partner specific
    relationshipToPatient: '',
    patientName: '',
    patientEmail: '',
    // Clinician specific
    credentials: '',
    licenseNumber: '',
    facility: '',
    specialty: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep('form');
  };

  const handleBackToRoleSelection = () => {
    setCurrentStep('role-selection');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Common validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^\d{10,}$/.test(formData.mobile_number.replace(/\D/g, ''))) {
      newErrors.mobile_number = 'Please enter a valid mobile number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validations
    if (selectedRole === 'patient') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = 'Emergency contact name is required';
      }
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = 'Emergency contact phone is required';
      }
    }

    if (selectedRole === 'care_partner') {
      if (!formData.relationshipToPatient.trim()) {
        newErrors.relationshipToPatient = 'Relationship to patient is required';
      }
      if (!formData.patientName.trim()) {
        newErrors.patientName = 'Patient name is required';
      }
    }

    if (selectedRole === 'clinician') {
      if (!formData.credentials.trim()) newErrors.credentials = 'Credentials are required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      if (!formData.facility.trim()) newErrors.facility = 'Facility/Practice is required';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard against double submission
    if (isLoading) return;

    if (!validateForm()) return;
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const role = selectedRole;

      const createdUser = await signup(
        formData.email.trim(),
        formData.password,
        name,
        role,
        formData.mobile_number.trim()
      );

      // Persist role-specific registration details (non-critical — failures are warnings only)
      try {
        await dataAPI.save('registration_profile', {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          mobile_number: formData.mobile_number.trim(),
          role,
          patient: {
            dateOfBirth: formData.dateOfBirth,
            emergencyContactName: formData.emergencyContactName.trim(),
            emergencyContactPhone: formData.emergencyContactPhone.trim(),
            medicalId: formData.medicalId.trim(),
          },
          carePartner: {
            relationshipToPatient: formData.relationshipToPatient.trim(),
            patientName: formData.patientName.trim(),
            patientEmail: formData.patientEmail.trim(),
          },
          clinician: {
            credentials: formData.credentials.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            facility: formData.facility.trim(),
            specialty: formData.specialty.trim(),
          },
        });
      } catch (persistError) {
        console.warn('Registration profile persistence skipped:', persistError);
      }

      const dashboardMap: Record<string, string> = {
        patient: '/patient/dashboard',
        care_partner: '/caregiver',
        caregiver: '/caregiver',
        clinician: '/clinician',
      };

      navigate(dashboardMap[createdUser.role] ?? '/');
    } catch (error: any) {
      const message = (error?.message || 'Failed to create account. Please try again.').trim();

      // Clear password fields on any API error — prevents stale passwords in the form
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      if (
        message.toLowerCase().includes('email') ||
        message.toLowerCase().includes('account') ||
        message.toLowerCase().includes('registered')
      ) {
        setErrors({ email: message });
      } else if (
        message.toLowerCase().includes('password')
      ) {
        setErrors({ password: message });
      } else {
        // Generic error — show at the top level (email field) so it's visible
        setErrors({ email: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'patient' as const,
      label: 'Patient',
      icon: UserRound,
      description: 'I am participating in the sleep intervention program',
      color: 'from-[#6D28D9] to-[#6D28D9]',
    },
    {
      id: 'care_partner' as const,
      label: 'Care Partner',
      icon: HandHeart,
      description: 'I am supporting a patient in the program',
      color: 'from-[#6D28D9] to-[#6D28D9]',
    },
    {
      id: 'clinician' as const,
      label: 'Clinician',
      icon: BriefcaseMedical,
      description: 'I am a healthcare provider managing patients',
      color: 'from-[#6D28D9] to-[#6D28D9]',
    },
  ];

  // Role Selection Step
  if (currentStep === 'role-selection') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12 relative">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#4A5565] hover:text-[#101828] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Back to Home</span>
        </button>
        <div className="w-full max-w-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-[#101828] mb-3">
              Create Your Account
            </h1>
            <p className="text-lg text-[#4A5565]">
              First, let us know how you'll be using the program
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id)}
                  className="w-full p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#6D28D9] hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-center space-x-6">
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-[#101828] mb-2">
                        {role.label}
                      </h3>
                      <p className="text-base text-[#4A5565]">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back to Sign In */}
          <div className="text-center">
            <p className="text-base text-[#4A5565]">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-[#6D28D9] hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div className="min-h-screen bg-gray-100 relative">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#4A5565] hover:text-[#101828] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-base">Back to Home</span>
      </button>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBackToRoleSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back to role selection</span>
          </button>

          <div className="flex items-center space-x-4 mb-6">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                roles.find((r) => r.id === selectedRole)?.color
              } flex items-center justify-center`}
            >
              {selectedRole === 'patient' && <UserRound className="w-7 h-7 text-white" />}
              {selectedRole === 'care_partner' && <HandHeart className="w-7 h-7 text-white" />}
              {selectedRole === 'clinician' && <BriefcaseMedical className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl" style={{ color: '#1f1f3d' }}>
                {selectedRole === 'patient' && 'Patient Registration'}
                {selectedRole === 'care_partner' && 'Care Partner Registration'}
                {selectedRole === 'clinician' && 'Clinician Registration'}
              </h1>
              <p className="text-base" style={{ color: '#6b7280' }}>
                Please provide your information to create an account
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(value) => handleInputChange('firstName', value)}
                  error={errors.firstName}
                  required
                />
                <InputField
                  id="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(value) => handleInputChange('lastName', value)}
                  error={errors.lastName}
                  required
                />
              </div>

              {selectedRole === 'patient' && (
                <div className="mt-6">
                  <InputField
                    id="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(value) => handleInputChange('dateOfBirth', value)}
                    error={errors.dateOfBirth}
                    required
                  />
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                Contact Information
              </h2>
              <div className="space-y-6">
                <InputField
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  error={errors.email}
                  required
                  helpText="We'll use this to send important program updates"
                />
                <InputField
                  id="mobile_number"
                  label="Phone Number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.mobile_number}
                  onChange={(value) => handleInputChange('mobile_number', value)}
                  error={errors.mobile_number}
                  required
                />
              </div>
            </div>

            {/* Patient-Specific Fields */}
            {selectedRole === 'patient' && (
              <div>
                <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                  Emergency Contact
                </h2>
                <div className="space-y-6">
                  <InputField
                    id="emergencyContactName"
                    label="Emergency Contact Name"
                    placeholder="Full Name"
                    value={formData.emergencyContactName}
                    onChange={(value) => handleInputChange('emergencyContactName', value)}
                    error={errors.emergencyContactName}
                    required
                  />
                  <InputField
                    id="emergencyContactPhone"
                    label="Emergency Contact Phone"
                    type="tel"
                    placeholder="(551)362-9680"
                    value={formData.emergencyContactPhone}
                    onChange={(value) => handleInputChange('emergencyContactPhone', formatPhoneNumber(value))}
                    error={errors.emergencyContactPhone}
                    required
                  />
                  <InputField
                    id="medicalId"
                    label="Medical Record Number (Optional)"
                    placeholder="MRN-12345"
                    value={formData.medicalId}
                    onChange={(value) => handleInputChange('medicalId', value)}
                    helpText="If you have a medical record number, enter it here"
                  />
                </div>
              </div>
            )}

            {/* Care Partner-Specific Fields */}
            {selectedRole === 'care_partner' && (
              <div>
                <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                  Patient Information
                </h2>
                <div className="space-y-6">
                  <InputField
                    id="relationshipToPatient"
                    label="Relationship to Patient"
                    placeholder="e.g., Spouse, Child, Friend"
                    value={formData.relationshipToPatient}
                    onChange={(value) => handleInputChange('relationshipToPatient', value)}
                    error={errors.relationshipToPatient}
                    required
                  />
                  <InputField
                    id="patientName"
                    label="Patient's Full Name"
                    placeholder="Patient Name"
                    value={formData.patientName}
                    onChange={(value) => handleInputChange('patientName', value)}
                    error={errors.patientName}
                    required
                  />
                  <InputField
                    id="patientEmail"
                    label="Patient's Email (Optional)"
                    type="email"
                    placeholder="patient.email@example.com"
                    value={formData.patientEmail}
                    onChange={(value) => handleInputChange('patientEmail', value)}
                    helpText="This helps us connect you with the patient's account"
                  />
                </div>
              </div>
            )}

            {/* Clinician-Specific Fields */}
            {selectedRole === 'clinician' && (
              <div>
                <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                  Professional Information
                </h2>
                <div className="space-y-6">
                  <InputField
                    id="credentials"
                    label="Credentials"
                    placeholder="e.g., MD, PhD, NP, RN"
                    value={formData.credentials}
                    onChange={(value) => handleInputChange('credentials', value)}
                    error={errors.credentials}
                    required
                  />
                  <InputField
                    id="licenseNumber"
                    label="License Number"
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={(value) => handleInputChange('licenseNumber', value)}
                    error={errors.licenseNumber}
                    required
                  />
                  <InputField
                    id="facility"
                    label="Facility / Practice Name"
                    placeholder="Hospital or Practice Name"
                    value={formData.facility}
                    onChange={(value) => handleInputChange('facility', value)}
                    error={errors.facility}
                    required
                  />
                  <InputField
                    id="specialty"
                    label="Specialty (Optional)"
                    placeholder="e.g., Sleep Medicine, Geriatrics, Neurology"
                    value={formData.specialty}
                    onChange={(value) => handleInputChange('specialty', value)}
                  />
                </div>
              </div>
            )}

            {/* Account Security Section */}
            <div>
              <h2 className="text-xl mb-4 pb-2 border-b border-gray-200" style={{ color: '#1f1f3d' }}>
                Account Security
              </h2>
              <div className="space-y-6">
                <PasswordField
                  id="password"
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  error={errors.password}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(!showPassword)}
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(value) => handleInputChange('confirmPassword', value)}
                  error={errors.confirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm mb-2" style={{ color: '#4b5563' }}>
                    Password must contain:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Check
                        className={`w-4 h-4 ${
                          formData.password.length >= 8 ? 'text-teal-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-600">At least 8 characters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="w-5 h-5 rounded border-2 border-gray-300 mt-1"
                />
                <Label htmlFor="terms" className="flex-col items-start gap-1 text-base cursor-pointer leading-relaxed" style={{ color: '#4b5563' }}>
                  <span className="block">
                    I agree to the{' '}
                    <a href="#" className="text-[#6D28D9] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-[#6D28D9] hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </span>
                  <span className="block">
                    I understand that this program is not meant for collecting sensitive medical information.
                  </span>
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-600 ml-8">{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-base" style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-purple-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}