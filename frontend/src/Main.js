import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';
import api from './api';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Main() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: result } = await api.get('/posts/');
        setData(result);
      } catch (error) {
        if (!userInfo) navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate, userInfo]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Announcements</h1>
        <span className="text-sm text-slate-500">
          {data.length} {data.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : data.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-500">No announcements yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.slice().reverse().map((a) => (
            <Card key={a.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">{a.title}</h2>
                <span className="flex-none text-xs text-slate-500">
                  {formatDate(a.created_at)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {a.body}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
