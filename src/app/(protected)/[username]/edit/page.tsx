// File: page.tsx
// Path: /src/app/(protected)/[username]/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Upload, Loader2, Save, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    smart_link: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [error, setError] = useState('');
  const [smartLinkError, setSmartLinkError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [params.username]);

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', params.username)
        .single();

      if (profileError) throw profileError;

      // Verify user owns this profile
      if (profileData.id !== session.user.id) {
        router.push(`/profile/${params.username}`);
        return;
      }

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        smart_link: profileData.smart_link || '',
      });
      setAvatarPreview(profileData.avatar_url || '');
      setBannerPreview(profileData.banner_url || '');
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function validateSmartLink(link: string): boolean {
    if (!link) return true; // Empty is valid

    const rolinkPattern = /^https?:\/\/(www\.)?rolink\.me\/.+$/i;
    return rolinkPattern.test(link);
  }

  function handleSmartLinkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    setFormData({ ...formData, smart_link: value });

    if (value && !validateSmartLink(value)) {
      setSmartLinkError('Only rolink.me Smart Links are allowed');
    } else {
      setSmartLinkError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate smart link before submitting
    if (formData.smart_link && !validateSmartLink(formData.smart_link)) {
      setSmartLinkError('Only rolink.me Smart Links are allowed');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let avatarUrl = profile.avatar_url;
      let bannerUrl = profile.banner_url;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Upload banner if changed
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, bannerFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);

        bannerUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          smart_link: formData.smart_link || null,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      router.push(`/profile/${params.username}`);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/profile/${params.username}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update your profile information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banner Image
              </label>
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {bannerPreview && (
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: 1500x500px, Max 10MB
              </p>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  {avatarPreview && (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition cursor-pointer">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload<br/>
                  <span className="text-xs">Max 5MB</span>
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your full name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Smart Link (rolink.me only) */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Smart Link (Release Organizer Partnership)
              </label>
              
              {/* Partnership Info Box */}
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Due to our partnership with Release Organizer, we exclusively support rolink.me Smart Links. 
                    This allows you to showcase all your platforms in one unified link.
                  </p>
                </div>
              </div>

              <input
                type="url"
                value={formData.smart_link}
                onChange={handleSmartLinkChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  smartLinkError 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://rolink.me/yourlink"
              />
              
              {smartLinkError ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {smartLinkError}
                </p>
              ) : (
                <div className="mt-2">
                  <a
                    href="https://releaseorganizer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create your free Smart Link at releaseorganizer.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving || !!smartLinkError}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
              
              <Link
                href={`/profile/${params.username}`}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}