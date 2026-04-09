import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    cover_image: '',
    published: true
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const path = isEditing && id ? `/edit/${id}` : '/new';
      navigate(`/login?redirect=${encodeURIComponent(path)}`, { replace: true });
      return;
    }
    if (isEditing && id) {
      fetchPost();
    }
  }, [id, isEditing, user, authLoading, navigate]);

  async function fetchPost() {
    if (!id || !user) return;
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setInitialLoading(false);
        return;
      }
      if (data.author_id !== user.id) {
        setForbidden(true);
        setInitialLoading(false);
        return;
      }
      setFormData({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        cover_image: data.cover_image || '',
        published: data.published
      });
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const excerpt = formData.excerpt.trim();
    const coverImage = formData.cover_image.trim() || null;

    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: formData.title,
            content: formData.content,
            excerpt,
            cover_image: coverImage,
            published: formData.published,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('author_id', user.id);

        if (error) throw error;
        navigate(`/post/${id}`);
      } else {
        const row: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> = {
          author_id: user.id,
          title: formData.title,
          content: formData.content,
          excerpt,
          cover_image: coverImage,
          published: formData.published
        };

        const { data, error } = await supabase.from('blog_posts').insert([row]).select().single();

        if (error) throw error;
        navigate(`/post/${data.id}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading…</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">You can’t edit this post</h2>
          <p className="text-slate-600 mb-6">Only the author can make changes.</p>
          <Link to="/" className="text-slate-900 font-semibold underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to={isEditing && id ? `/post/${id}` : '/'}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isEditing ? 'Back to post' : 'Back to home'}
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
                placeholder="Enter a captivating title..."
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-semibold text-slate-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all resize-none"
                placeholder="A brief description of your post..."
              />
            </div>

            <div>
              <label htmlFor="cover_image" className="block text-sm font-semibold text-slate-700 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all"
                placeholder="https://images.pexels.com/..."
              />
              <p className="mt-2 text-sm text-slate-500">
                Use high-quality images from Pexels or similar sources
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                required
                rows={15}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20 outline-none transition-all resize-y font-mono text-sm"
                placeholder="Write your story..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:ring-opacity-20"
              />
              <label htmlFor="published" className="ml-3 text-sm font-medium text-slate-700">
                Publish immediately
              </label>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                type="submit"
                disabled={loading || !user}
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 transform hover:scale-105"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : isEditing ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
