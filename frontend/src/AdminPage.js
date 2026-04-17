import React, { useState } from 'react';
import api from './api';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Alert from './ui/Alert';

export default function AdminPage() {
  const [postCreateTitle, setPostCreateTitle] = useState('');
  const [postCreateBody, setPostCreateBody] = useState('');
  const [postDeleteTitle, setPostDeleteTitle] = useState('');

  const [evCreateTitle, setEvCreateTitle] = useState('');
  const [evCreateDesc, setEvCreateDesc] = useState('');
  const [evCreateTeam, setEvCreateTeam] = useState('');
  const [evCreateDate, setEvCreateDate] = useState('');
  const [evDeleteTitle, setEvDeleteTitle] = useState('');

  const [flash, setFlash] = useState(null);

  const show = (severity, message) => {
    setFlash({ severity, message });
    setTimeout(() => setFlash(null), 3000);
  };

  const createPost = async () => {
    try {
      await api.post('/posts/create_post/', { title: postCreateTitle, body: postCreateBody });
      show('success', 'Announcement created.');
      setPostCreateTitle(''); setPostCreateBody('');
    } catch (e) { show('error', 'Failed to create announcement.'); }
  };

  const deletePost = async () => {
    try {
      await api.post('/posts/delete_post/', { title: postDeleteTitle });
      show('success', 'Announcement deleted.');
      setPostDeleteTitle('');
    } catch (e) { show('error', 'Failed to delete announcement.'); }
  };

  const createEvent = async () => {
    try {
      await api.post('/timeline/', {
        title: evCreateTitle,
        description: evCreateDesc,
        team: Number(evCreateTeam),
        date: evCreateDate,
      });
      show('success', 'Timeline event created.');
      setEvCreateTitle(''); setEvCreateDesc(''); setEvCreateTeam(''); setEvCreateDate('');
    } catch (e) { show('error', 'Failed to create event.'); }
  };

  const deleteEvent = async () => {
    try {
      const { data: rows } = await api.get('/timeline/');
      const match = rows.find((r) => r.title === evDeleteTitle);
      if (!match) { show('error', 'No event with that title.'); return; }
      await api.delete(`/timeline/${match.id}/`);
      show('success', 'Timeline event deleted.');
      setEvDeleteTitle('');
    } catch (e) { show('error', 'Failed to delete event.'); }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin tools</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage global announcements and timeline events.
        </p>
      </div>

      {flash && <Alert severity={flash.severity}>{flash.message}</Alert>}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Create</h3>
            <Input label="Title" value={postCreateTitle} onChange={(e) => setPostCreateTitle(e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                rows={4}
                value={postCreateBody}
                onChange={(e) => setPostCreateBody(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button onClick={createPost}>Create</Button>
          </div>
          <div className="space-y-3 md:border-l md:border-slate-200 md:pl-6">
            <h3 className="text-sm font-medium text-slate-700">Delete</h3>
            <Input label="Title" value={postDeleteTitle} onChange={(e) => setPostDeleteTitle(e.target.value)} />
            <Button variant="danger" onClick={deletePost}>Delete</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Timeline events</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Create</h3>
            <Input label="Title" value={evCreateTitle} onChange={(e) => setEvCreateTitle(e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows={3}
                value={evCreateDesc}
                onChange={(e) => setEvCreateDesc(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Input label="Team ID" value={evCreateTeam} onChange={(e) => setEvCreateTeam(e.target.value)} />
            <Input label="Date" type="date" value={evCreateDate} onChange={(e) => setEvCreateDate(e.target.value)} />
            <Button onClick={createEvent}>Create</Button>
          </div>
          <div className="space-y-3 md:border-l md:border-slate-200 md:pl-6">
            <h3 className="text-sm font-medium text-slate-700">Delete</h3>
            <Input label="Title" value={evDeleteTitle} onChange={(e) => setEvDeleteTitle(e.target.value)} />
            <Button variant="danger" onClick={deleteEvent}>Delete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
