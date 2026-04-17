import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import api from './api';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';
import Card from './ui/Card';

export default function Register() {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamBio, setTeamBio] = useState('');

  const [bioError, setBioError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBioError('');
    setGeneralError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('signup/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        team: teamBio,
      });
      updateUser({ ...data.user, token: data.token });
      navigate('/');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error;
      if (status === 400 && typeof message === 'string' && message.toLowerCase().includes('team bio')) {
        setBioError(message);
      } else if (status === 400) {
        setGeneralError(message || 'Please check your details and try again.');
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            Q
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="text-sm text-slate-500">Register to join your team.</p>
        </div>
        <Card className="p-6">
          {generalError && (
            <Alert severity="error" className="mb-4">
              {generalError}
            </Alert>
          )}
          {bioError && (
            <Alert severity="error" className="mb-4">
              {bioError}
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                required
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                label="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Team invite code"
              required
              value={teamBio}
              onChange={(e) => setTeamBio(e.target.value)}
              error={bioError || undefined}
              helper={bioError ? undefined : 'Provided by your team lead.'}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Register'}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
