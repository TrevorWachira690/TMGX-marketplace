import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SEO from '../components/SEO.jsx';

export default function Profile() {
  const { id } = useParams();
  const { user: loggedInUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '', avatar: '' });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      try {
        const [userData, listingsData] = await Promise.all([
          api.getUser(id),
          api.getUserPosts(id),
        ]);
        if (cancelled) return;
        setProfile(userData);
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setFormData({
          username: userData.username || '',
          bio: userData.bio || '',
          avatar: userData.avatar || '',
        });
        setAvatarPreview(userData.avatar || '');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      const updated = await api.updateMe(formData);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8 text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <EmptyState title="User not found" message="This user does not exist." />
      </div>
    );
  }

  const isOwnProfile = loggedInUser && profile.id === loggedInUser._id;
  const isBusiness = profile.role === 'business';

  return (
    <>
      <SEO
        title={`TBM-DeepIn - ${profile.username}`}
        description={`View ${profile.username}'s profile and listings on TBM-DeepIn.`}
      />

      <div className="max-w-2xl mx-auto p-4">
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 text-sm mb-4 inline-block">
          ← Back to listings
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-2xl font-bold">
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-gray-500 text-sm">
                {isBusiness ? (
                  <span>
                    {profile.businessType === 'company' ? '🏢 Company' : '💼 Entrepreneur'}
                    {profile.businessName && ` — ${profile.businessName}`}
                  </span>
                ) : (
                  '👤 Customer'
                )}
              </p>
              {isBusiness && profile.category && (
                <p className="text-gray-600 dark:text-gray-300 text-sm">{profile.category}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}

          {isBusiness && profile.location && (
            <p className="text-sm text-gray-500 mb-1">📍 {profile.location}</p>
          )}

          {isBusiness && profile.whatsappNumber && (
            <p className="text-sm">
              📞{' '}
              <a
                href={`https://wa.me/${profile.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {profile.whatsappNumber}
              </a>
            </p>
          )}

          {isOwnProfile && (
            <>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700"
                >
                  Edit Profile
                </button>
              ) : (
                <form onSubmit={handleUpdate} className="mt-4 space-y-3">
                  {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
                  <div>
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover mb-2"
                      />
                    )}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username"
                    minLength={3}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Bio"
                    maxLength={280}
                    rows={3}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4">
          {profile.username}'s Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <EmptyState
            title="No listings"
            message={isOwnProfile ? 'Create your first listing!' : 'This user has no listings yet.'}
          />
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  <Link to={`/posts/${listing._id}`}>{listing.title}</Link>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                  {listing.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="font-medium">${listing.price?.toLocaleString()}</span>
                  <span>{listing.category}</span>
                  {!listing.published && <span>Draft</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}