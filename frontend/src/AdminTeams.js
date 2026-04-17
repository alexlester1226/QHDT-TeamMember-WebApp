import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import UserContext from './UserContext';
import api from './api';
import Card from './ui/Card';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';

export default function AdminTeams() {
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userInfo && !userInfo.is_staff) {
      navigate('/');
      return;
    }
    async function load() {
      try {
        const { data } = await api.get('list_teams/');
        setTeams(data);
      } catch (e) {
        setError('Unable to load teams.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userInfo, navigate]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">All teams</h1>
        {!loading && !error && (
          <span className="text-sm text-slate-500">
            {teams.length} {teams.length === 1 ? 'team' : 'teams'}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16"><Spinner /></div>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && teams.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-500">No teams yet.</p>
        </Card>
      )}

      {!loading && !error && teams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/admin/team/${encodeURIComponent(team.bio)}`}
              className="group block"
            >
              <Card className="h-full p-6 transition hover:border-slate-300 hover:shadow">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    {team.name}
                  </h3>
                  <ArrowRightIcon className="h-4 w-4 flex-none text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {team.title}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
                  <span>Invite code</span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                    {team.bio}
                  </code>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
