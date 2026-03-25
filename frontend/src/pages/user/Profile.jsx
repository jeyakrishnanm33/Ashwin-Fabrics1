// src/pages/user/Profile.jsx
import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import api from '@utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', form);
      await fetchUserProfile(user.uid);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-lg">
        <h1 className="text-3xl font-black mb-8">My Profile</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-black">
              {(userProfile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{userProfile?.name || 'User'}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                ${userProfile?.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {userProfile?.role || 'user'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              {editing ? (
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
              ) : (
                <p className="text-sm text-gray-600 px-4 py-3 bg-gray-50 rounded-xl">{userProfile?.name || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              {editing ? (
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm" />
              ) : (
                <p className="text-sm text-gray-600 px-4 py-3 bg-gray-50 rounded-xl">{userProfile?.phone || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <p className="text-sm text-gray-400 px-4 py-3 bg-gray-50 rounded-xl">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-50">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
