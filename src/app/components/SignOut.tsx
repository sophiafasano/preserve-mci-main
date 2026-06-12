import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/useAuth';

export default function SignOut() {
  const navigate = useNavigate();
  const { signout } = useAuth();

  useEffect(() => {
    const performSignout = async () => {
      await signout();
      navigate('/', { replace: true });
    };

    performSignout();
  }, [navigate, signout]);

  return (
    <div className="nondashboard-ds min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-lg text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}