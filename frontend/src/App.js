import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';
import Main from './Main';
import SignIn from './SignIn';
import Register from './Register';
import NotFound from './NotFound';
import Team from './Team';
import Timeline from './Timeline';
import Admin from './Admin';
import AdminTeams from './AdminTeams';
import AdminTeamView from './AdminTeamView';
import UserContext from './UserContext';
import api from './api';
import Spinner from './ui/Spinner';

function MyTeamRoute() {
  const { userInfo } = useContext(UserContext);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo?.team) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const { data: t } = await api.post('search_team/', { team: userInfo.team });
        const users = await Promise.all(
          (t.users || []).map((id) => api.post('get_user/', { id }).then((r) => r.data)),
        );
        const memos = await Promise.all(
          (t.memos || []).map((id) => api.post('get_memo/', { id }).then((r) => r.data)),
        );
        setTeam({ ...t, users, memos });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userInfo]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!team) return <NotFound />;
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

function ShellRoute({ children }) {
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<SignIn />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ShellRoute><Main /></ShellRoute>} />
      <Route path="/timeline" element={<ShellRoute><Timeline /></ShellRoute>} />
      <Route path="/team/:bio" element={<ShellRoute><MyTeamRoute /></ShellRoute>} />
      <Route path="/admin" element={<ShellRoute><Admin /></ShellRoute>} />
      <Route path="/admin/teams" element={<ShellRoute><AdminTeams /></ShellRoute>} />
      <Route path="/admin/team/:bio" element={<ShellRoute><AdminTeamView /></ShellRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
