import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import PatientLayout from './PatientLayout';

export default function SleepTips() {
  const navigate = useNavigate();

  const stimulusControlTips = [
    "Don't use bed or bedroom for anything, at any time of the day other than sleep and sex",
    "If you do not fall asleep within 15-20 min, leave the bed and do something in another room. Only go to bed when sleepy",
    "If you wake up during the night and do not fall back asleep within 20 minutes, follow rule 2 above",
    "Avoid napping",
    "Maintain a regular bedtime and wake time",
  ];

  const sleepHygieneTips = [
    "Avoid caffeine after noon",
    "Avoid exercise within 2 hours of bedtime",
    "Avoid nicotine within 2 hours of bedtime",
    "Avoid alcohol within 2 hours of bedtime",
    "Avoid heavy meals within 2 hours of bedtime",
    "Avoid screen time within 1 hour of bedtime",
  ];

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back to Dashboard</span>
          </button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl" style={{ color: '#1f1f3d' }}>
                Sleep Tips
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Evidence-based strategies for better sleep
              </p>
            </div>
          </div>
        </div>

        {/* Stimulus Control Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
              <span className="text-base text-purple-700">
                Behavioral Technique
              </span>
            </div>
            <h2 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
              Stimulus Control
            </h2>
            <p className="text-lg text-gray-600">
              Train your brain to associate your bed with sleep
            </p>
          </div>

          <div className="space-y-4">
            {stimulusControlTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-lg">
                  {index + 1}
                </div>
                <p className="text-base text-gray-700 leading-relaxed pt-1">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Hygiene Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
              <span className="text-base text-teal-700">
                Lifestyle Habits
              </span>
            </div>
            <h2 className="text-3xl mb-3" style={{ color: '#1f1f3d' }}>
              Sleep Hygiene
            </h2>
            <p className="text-lg text-gray-600">
              Daily habits that promote better sleep quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sleepHygieneTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-teal-50 border border-teal-100">
                <CheckCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-base text-gray-700 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl border border-purple-200 p-8 mb-8">
          <h3 className="text-2xl mb-4" style={{ color: '#1f1f3d' }}>
            How to Use These Tips
          </h3>
          <div className="space-y-4 text-base text-gray-700">
            <p>
              <strong className="text-purple-700">Stimulus Control</strong> helps re-establish the bed as a cue for sleep by strengthening the association between the bed and sleep, while weakening the association between the bed and wakefulness.
            </p>
            <p>
              <strong className="text-teal-700">Sleep Hygiene</strong> focuses on creating optimal conditions for sleep by avoiding substances and activities that can interfere with sleep quality.
            </p>
            <p className="text-sm text-gray-600 italic mt-4">
              Consistency is key. It may take several weeks of practice before you notice significant improvements in your sleep quality.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/patient/dashboard')}
            variant="outline"
            className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/modules')}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md"
          >
            View Weekly Modules
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}
