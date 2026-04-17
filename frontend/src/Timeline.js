import React, { useEffect, useState } from 'react';
import api from './api';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Timeline() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/timeline/');
        setRows(data);
      } catch (error) {
        console.error('Error fetching timeline data:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Timeline</h1>
        <span className="text-sm text-slate-500">
          {rows.length} {rows.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-500">No timeline events yet.</p>
        </Card>
      ) : (
        <>
          {/* Table for sm+ */}
          <Card className="hidden overflow-hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Team</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {row.title}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{row.description}</td>
                    <td className="px-6 py-3 text-slate-600">{row.team_name}</td>
                    <td className="px-6 py-3 text-right text-slate-600">
                      {formatDate(row.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {/* Card stack for mobile */}
          <div className="space-y-3 sm:hidden">
            {rows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{row.title}</h3>
                  <span className="text-xs text-slate-500">{formatDate(row.date)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{row.description}</p>
                <p className="mt-2 text-xs text-slate-500">{row.team_name}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
