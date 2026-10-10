import React, { useState } from 'react';
import { INITIAL_NOTES } from '../data/mockTelecomData';
import { FieldNote } from '../types/telecom';
import { Plus, Pin, Clock, User, Check, Trash2, FileText } from 'lucide-react';

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<FieldNote[]>(INITIAL_NOTES);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry: FieldNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      category: 'Field Operations',
      body: newBody.trim() || 'Log verified by on-site optical network technician.',
      timestamp: 'Just now',
      author: 'Field Engineer #12',
      pinned: true
    };

    setNotes([newEntry, ...notes]);
    setNewTitle('');
    setNewBody('');
    setIsAdding(false);
  };

  const togglePin = (id: string) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto pb-32">
      {/* Top Header matching video 00:09 */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-xs text-amber-400 font-semibold cursor-pointer">
            ‹ Lookups
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
            Notes
          </h1>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      <div className="px-5 py-4 space-y-5 max-w-lg mx-auto w-full">
        {/* New Note Form */}
        {isAdding && (
          <form
            onSubmit={handleAddNote}
            className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/40 space-y-3 animate-in fade-in duration-150"
          >
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Add Field Operational Log
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title (e.g. Bumhvad Splice Tray Check)"
              autoFocus
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Technical observations, OTDR fiber readings, core colors..."
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Note
              </button>
            </div>
          </form>
        )}

        {/* Section: Today */}
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
            Today
          </div>

          <div className="space-y-3">
            {notes
              .filter((n) => n.pinned)
              .map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 hover:border-neutral-700 transition-all shadow-md group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePin(note.id)}
                        className="text-amber-400 p-1 hover:text-amber-300"
                        title="Unpin"
                      >
                        <Pin className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-neutral-500 hover:text-red-400 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed font-sans">
                    {note.body}
                  </p>

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.timestamp}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {note.author}
                    </span>
                    <span>·</span>
                    <span className="text-amber-400/90">{note.category}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section: Previous Notes */}
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
            Archived Logs
          </div>

          <div className="space-y-2">
            {notes
              .filter((n) => !n.pinned)
              .map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {note.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                      {note.body}
                    </p>
                    <div className="text-[10px] text-neutral-400 mt-1">
                      {note.timestamp} · {note.author}
                    </div>
                  </div>

                  <button
                    onClick={() => togglePin(note.id)}
                    className="text-neutral-500 hover:text-amber-400 p-1.5 cursor-pointer"
                    title="Pin to Today"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
