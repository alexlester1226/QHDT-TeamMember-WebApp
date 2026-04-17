import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import TeamHeader from './TeamHeader';
import Person from './Person';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Dialog from './ui/Dialog';
import api from './api';

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

export default function Team({ id, name, title, users = [], memos = [], bio }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [delTitle, setDelTitle] = useState('');
  const [delError, setDelError] = useState('');
  const [saving, setSaving] = useState(false);

  const resetCreate = () => {
    setNewTitle('');
    setNewBody('');
  };
  const resetDelete = () => {
    setDelTitle('');
    setDelError('');
  };

  const createMemo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/memos/', { title: newTitle, body: newBody, team: id });
      window.location.reload();
    } catch (err) {
      console.error('Error creating memo:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteMemo = async (e) => {
    e.preventDefault();
    setDelError('');
    const match = memos.find((m) => m.title === delTitle);
    if (!match) {
      setDelError('No announcement matches that title.');
      return;
    }
    setSaving(true);
    try {
      await api.delete(`/memos/${match.id}/`);
      window.location.reload();
    } catch (err) {
      console.error('Error deleting memo:', err);
      setDelError('Failed to delete. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TeamHeader name={name} title={title} bio={bio} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { resetCreate(); setCreateOpen(true); }}
              >
                <PlusIcon className="h-4 w-4" /> Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { resetDelete(); setDeleteOpen(true); }}
              >
                <TrashIcon className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          {memos.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-sm text-slate-500">No announcements yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {memos.slice().reverse().map((memo) => (
                <Card key={memo.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      {memo.title}
                    </h3>
                    <span className="flex-none text-xs text-slate-500">
                      {formatDate(memo.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {memo.body}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Team members
          </h2>
          <Card className="p-4">
            {users.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                No members yet.
              </p>
            ) : (
              <ul>
                {users.map((user) => (
                  <Person
                    key={user.id}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    type={user.type}
                  />
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New announcement"
        description="Share an update with your team."
      >
        <form className="space-y-4" onSubmit={createMemo}>
          <Input
            label="Title"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Content
            </label>
            <textarea
              rows={4}
              required
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Posting…' : 'Post'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete announcement"
        description="Enter the exact title to remove."
      >
        <form className="space-y-4" onSubmit={deleteMemo}>
          <Input
            label="Title"
            required
            value={delTitle}
            onChange={(e) => setDelTitle(e.target.value)}
            error={delError || undefined}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={saving}>
              {saving ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
