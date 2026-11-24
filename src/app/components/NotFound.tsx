import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nondashboard-ds min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-6">
            <span className="text-6xl">404</span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl mb-4" style={{ color: '#1f1f3d' }}>
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          We couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-14 px-8 rounded-xl text-lg border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="h-14 px-8 rounded-xl text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg w-full sm:w-auto"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
