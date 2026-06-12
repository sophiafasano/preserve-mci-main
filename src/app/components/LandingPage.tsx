import {
  Moon,
  BookOpen,
  Video,
  PenTool,
  TrendingUp,
  Bell,
  CheckCircle,
  Users,
  Heart,
  Stethoscope,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  Activity,
  Brain,
  Compass,
} from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksAnimation from './HowItWorksAnimation';

export default function LandingPage() {
  const navigate = useNavigate();

  const whoItsFor = [
    {
      title: 'Patients',
      description: 'Adults with Mild Cognitive Impairment seeking better sleep and cognitive health',
      icon: Heart,
      color: 'purple',
    },
    {
      title: 'Care Partners',
      description: 'Family members and caregivers supporting their loved ones\' wellness journey',
      icon: Users,
      color: 'teal',
    },
    {
      title: 'Clinicians',
      description: 'Healthcare providers monitoring patient progress and intervention outcomes',
      icon: Stethoscope,
      color: 'purple',
    },
  ];

  const keyFeatures = [
    {
      title: 'Weekly Sleep Modules',
      description: 'Structured, easy-to-follow lessons designed specifically for cognitive wellness',
      icon: BookOpen,
    },
    {
      title: 'Video Content',
      description: 'Clear, accessible videos with expert guidance and demonstrations',
      icon: Video,
    },
    {
      title: 'Interactive Exercises',
      description: 'Practice new sleep habits with guided exercises and worksheets',
      icon: PenTool,
    },
    {
      title: 'Progress Tracking',
      description: 'Visual charts and reports to see your sleep improvement over time',
      icon: BarChart3,
    },
    {
      title: 'Sleep Journal',
      description: 'Log your sleep patterns and receive personalized feedback',
      icon: Moon,
    },
    {
      title: 'Smart Reminders',
      description: 'Gentle reminders to help you stay on track with your program',
      icon: Bell,
    },
  ];

  const howItWorksSteps = [
    {
      number: '1',
      title: 'Create Your Account',
      description: 'Sign up as a patient, care partner, or clinician in just a few simple steps',
      icon: UserCheck,
    },
    {
      number: '2',
      title: 'Complete Weekly Modules',
      description: 'Engage with personalized intervention content tailored to your specific needs',
      icon: BookOpen,
    },
    {
      number: '3',
      title: 'Track Progress',
      description: 'Monitor your activity pattern and cognitive wellness with clear, easy-to-understand insights',
      icon: TrendingUp,
    },
    {
      number: '4',
      title: 'Stay Connected',
      description: 'Maintain communication with your care team and loved ones throughout your program',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Hero Section - Using New Component */}
      <HeroSection />

      {/* Features Section - Using New Component */}
      <FeaturesSection />

      {/* How It Works Animation */}
      <HowItWorksAnimation />
    </div>
  );
}