'use client';

// Edit client page
// Form to update client details

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EditClientPage() {
  const params = useParams();
  const clientId = params.clientId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    place: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setFetching(false);
          return;
        }
        const { data, error: fetchError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .eq('psychologist_id', user.id)
          .single();

        if (fetchError || !data) {
          setError('Client not found');
          setFetching(false);
          return;
        }
        setFormData({
          name: data.name || '',
          email: data.email || '',
          age: data.age != null ? String(data.age) : '',
          gender: data.gender || '',
          place: data.place || '',
        });
      } catch (err) {
        setError('Failed to load client');
      } finally {
        setFetching(false);
      }
    };
    loadClient();
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('You must be logged in to edit a client');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('clients')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          age: formData.age ? parseInt(formData.age, 10) : null,
          gender: formData.gender.trim() || null,
          place: formData.place.trim() || null,
        })
        .eq('id', clientId)
        .eq('psychologist_id', user.id);

      if (updateError) {
        setError(updateError.message || 'Failed to update client');
        setLoading(false);
        return;
      }
      window.location.href = `/dashboard/clients/${clientId}`;
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900">Client not found</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Link
          href="/dashboard/clients"
          className="mt-4 inline-block text-sm text-green-700 hover:text-green-600"
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="text-sm text-green-700 hover:text-green-600 mb-4 inline-block"
        >
          ← Back to Client
        </Link>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Edit Client</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update client details
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                type="number"
                name="age"
                id="age"
                min="1"
                max="150"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="place" className="block text-sm font-medium text-gray-700">
              Place
            </label>
            <input
              type="text"
              name="place"
              id="place"
              value={formData.place}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link
              href={`/dashboard/clients/${clientId}`}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
