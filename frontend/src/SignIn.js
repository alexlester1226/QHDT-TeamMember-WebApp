import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import api from './api';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import Card from './ui/Card';

export default function SignIn() {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('login/', { email, password });
      updateUser(data);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            Q
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">QHDT Member Management</p>
        </div>
        <Card className="p-6">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{' '}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
