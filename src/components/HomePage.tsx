import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BlogPostWithAuthor } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, User, SquarePen as PenSquare, LogIn, LogOut } from 'lucide-react';

export default function HomePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(display_name, avatar_url)')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as BlogPostWithAuthor[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const writeHref = user ? '/new' : '/login?redirect=/new';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center justify-center sm:justify-start flex-1">
              <BookOpen className="w-12 h-12 mr-3" />
              <h1 className="text-5xl font-bold">The Blog</h1>
            </div>
            <div className="flex items-center justify-center gap-3">
              {!authLoading && user ? (
                <>
                  <span className="text-sm text-slate-300 truncate max-w-[200px]">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign out
                  </button>
                </>
              ) : !authLoading ? (
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign in
                </Link>
              ) : null}
            </div>
          </div>
          <p className="text-xl text-slate-300 text-center max-w-2xl mx-auto mb-8">
            Discover stories, insights, and perspectives from writers around the world
          </p>
          <div className="flex justify-center">
            <Link
              to={writeHref}
              className="inline-flex items-center px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all transform hover:scale-105"
            >
              <PenSquare className="w-5 h-5 mr-2" />
              Write a Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">No posts yet</h3>
            <p className="text-slate-600 mb-6">Be the first to share your story!</p>
            <Link
              to={writeHref}
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
            >
              <PenSquare className="w-5 h-5 mr-2" />
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {post.cover_image ? (
                  <div className="h-48 overflow-hidden bg-slate-200">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.profiles?.display_name ?? 'Unknown author'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
