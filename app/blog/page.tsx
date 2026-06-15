import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
}

const mockPosts: BlogPost[] = [
  {
    id: "art-of-the-three-second-hook",
    title: "The Art of the 3-Second Hook: Retaining Attention in 2026",
    excerpt: "Attention spans are shorter than ever. Learn the exact script patterns and visual cues that top creators use to keep viewers from swiping away in the first few seconds.",
    category: "Writing Tips",
    date: "June 14, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    author: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    },
  },
  {
    id: "ai-video-editing-future",
    title: "How Generative AI is Reshaping the Post-Production Pipeline",
    excerpt: "An in-depth look at the shifting landscape of video editing, where manual tasks are automated, leaving more room for creative direction and pure storytelling.",
    category: "AI Technology",
    date: "May 28, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=800&auto=format&fit=crop",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
  },
  {
    id: "maximizing-seo-short-content",
    title: "Maximizing SEO & Distribution for Short-Form Video Scripts",
    excerpt: "Writing a script is only half the battle. Discover how to optimize your video metadata, automatic transcripts, and blog adaptations to command search algorithms.",
    category: "Marketing",
    date: "May 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    author: {
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    },
  },
];

export default function BlogPage() {
  const featuredPost = mockPosts[0];
  const recentPosts = mockPosts.slice(1);

  return (
    <div className="flex-1 w-full bg-background text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-clip min-h-screen flex flex-col justify-between">
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[130px] pointer-events-none" />

      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Insights & Guides
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            The Edito.ai{" "}
            <span className="bg-linear-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Learn strategies, hacks, and technical workflows from top creators and engineers to refine your editing and scale your digital audience.
          </p>
        </section>

        {/* Featured Post */}
        <section className="px-6 max-w-5xl mx-auto relative z-10 mb-16">
          <div className="group relative rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-6 md:p-8 glass-panel shadow-2xl overflow-hidden grid md:grid-cols-12 gap-8 items-center">
            {/* Image */}
            <div className="md:col-span-6 overflow-hidden rounded-2xl border border-zinc-800/80 aspect-16/10 w-full relative">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-purple-600/90 text-[11px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                {featuredPost.category}
              </div>
            </div>
            {/* Content */}
            <div className="md:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-4 text-zinc-500 text-xs font-semibold mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readTime}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-purple-400 transition-colors duration-300 tracking-tight leading-tight mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-zinc-400 leading-relaxed font-medium text-[14px] md:text-[15px] mb-6">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-9 h-9 rounded-full border border-zinc-700/50 object-cover"
                  />
                  <span className="text-sm font-semibold text-zinc-300">
                    {featuredPost.author.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                  Read Article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Posts Grid */}
        <section className="px-6 max-w-5xl mx-auto relative z-10 mb-20">
          <h3 className="text-xl font-bold text-white mb-8 border-b border-zinc-800/40 pb-3">
            Recent Articles
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="group relative flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-5 glass-panel shadow-lg hover:shadow-xl hover:border-zinc-700/60 transition-all duration-300"
              >
                {/* Image */}
                <div className="overflow-hidden rounded-xl border border-zinc-800/60 aspect-16/10 w-full relative mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-zinc-950/80 text-[10px] font-bold text-zinc-300 uppercase tracking-wider backdrop-blur-xs border border-zinc-800">
                    {post.category}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-semibold mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                {/* Content */}
                <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors duration-300 leading-snug mb-3">
                  {post.title}
                </h4>
                <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                {/* Author & CTA */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/30">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full border border-zinc-700/50 object-cover"
                    />
                    <span className="text-xs font-semibold text-zinc-400">
                      {post.author.name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                    Read
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
