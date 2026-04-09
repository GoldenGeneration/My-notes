import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { BlogPostWithAuthor } from "../types/database";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard as Edit2,
  Trash2,
} from "lucide-react";
import mcloud from "../assets/mcloud.jpg"

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPostWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  async function fetchPost() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setPost(data as BlogPostWithAuthor | null);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;
    if (!id || !user || post?.author_id !== user.id) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id)
        .eq("author_id", user.id);

      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
      setDeleting(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const isOwner =
    !authLoading && !!user && !!post && post.author_id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="mt-4 text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Post not found
          </h2>
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-900 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `
        linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.8)),
        url(${mcloud})
      `,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all posts
        </Link>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {post.cover_image && (
            <div className="h-96 overflow-hidden">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center text-slate-600 mb-8 space-x-6">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {post.profiles?.display_name ?? "Unknown author"}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>

            <div className="prose prose-lg prose-slate max-w-none mb-8">
              {post.content.split("\n").map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {isOwner && (
              <div className="pt-8 border-t border-slate-200 flex gap-4">
                <Link
                  to={`/edit/${post.id}`}
                  className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Post
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
