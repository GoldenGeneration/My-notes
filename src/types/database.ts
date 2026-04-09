export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

/** Row from `blog_posts` with embedded `profiles` from a join select */
export type BlogPostWithAuthor = BlogPost & {
  profiles: Pick<Profile, 'display_name' | 'avatar_url'> | null;
};

/** Optional: wire into `createClient<Database>(...)` once types match Supabase codegen. */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BlogPost, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
    };
  };
}
