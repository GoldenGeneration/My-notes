import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(redirect, { replace: true });
    }
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (isSignUp) {
        setMessage('Check your email to confirm your account, then sign in.');
        setIsSignUp(false);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="mb-8 inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <LogIn className="w-10 h-10 text-slate-900 mr-2" />
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.startsWith('Check your') ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsSignUp(!isSignUp);
          }}
          className="mt-4 w-full text-center text-sm text-slate-600 hover:text-slate-900"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}
