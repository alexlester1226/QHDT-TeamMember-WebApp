import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Team from './Team';
import UserContext from './UserContext';
import api from './api';
import Alert from './ui/Alert';
import Spinner from './ui/Spinner';

export default function AdminTeamView() {
  const { bio } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userInfo && !userInfo.is_staff) {
      navigate('/');
      return;
    }
    async function load() {
      try {
        const { data: t } = await api.post('search_team/', { team: bio });
        const users = await Promise.all(
          (t.users || []).map((id) => api.post('get_user/', { id }).then((r) => r.data)),
        );
        const memos = await Promise.all(
          (t.memos || []).map((id) => api.post('get_memo/', { id }).then((r) => r.data)),
        );
        setTeam({ ...t, users, memos });
      } catch (e) {
        setError(e.response?.status === 404 ? 'Team not found.' : 'Failed to load team.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bio, userInfo, navigate]);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!team) return null;

  return (
    <Team
      id={team.id}
      name={team.name}
      title={team.title}
      users={team.users}
      memos={team.memos}
      bio={team.bio}
    />
  );
}
