import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Code, Heart, MessageSquare } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 w-full bg-background text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-clip min-h-screen flex flex-col justify-between">
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none" />

      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            {"We're building the editor we "}
            <span className="bg-linear-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              always wanted.
            </span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            We are a tiny team of creators and developers who got tired of spending hours on repetitive editing tasks—like writing captions, trimming pauses, and formatting transcripts. We built Edito.ai to put the tedious work on autopilot.
          </p>
        </section>



        {/* Our Story & Beliefs */}
        <section className="py-8 px-6 max-w-5xl mx-auto relative z-10 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">
                Our Story: Why we started this
              </h2>
              <div className="space-y-4 text-zinc-400 leading-relaxed font-medium text-[14px]">
                <p>
                  Edito.ai started as a side project between three friends. We were editing YouTube videos and TikToks on weekends, and noticed how much time we wasted doing the same tedious tasks over and over—transcribing audio, typing captions, and adjusting aspect ratios.
                </p>
                <p>
                  {"We built a few custom scripts to automate those steps for ourselves. When we showed them to other creator friends, they wanted to use them too. That's when we realized this could help a lot more people. We are just starting our journey, and we're committed to making content creation simple and fun."}
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 glass-panel shadow-2xl overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500" />
              <h3 className="text-lg font-bold text-white mb-4">What we believe in</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <Code className="w-4 h-4 text-purple-400" />,
                    title: "Speed over bloat",
                    desc: "Software should be fast. We avoid heavy features and focus on what you actually use.",
                  },
                  {
                    icon: <Heart className="w-4 h-4 text-indigo-400" />,
                    title: "Built with honesty",
                    desc: "No fake stats, marketing jargon, or over-promising. Just tools that save you time.",
                  },
                  {
                    icon: <MessageSquare className="w-4 h-4 text-violet-400" />,
                    title: "Open to feedback",
                    desc: "We build in public. If you request a feature or find a bug, we'll fix it directly.",
                  },
                ].map((val, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800">
                      {val.icon}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-semibold text-white">{val.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feedback CTA */}
        <section className="py-16 px-6 max-w-4xl mx-auto text-center relative z-10 mb-20 rounded-2xl border border-zinc-800/40 bg-zinc-950/40 backdrop-blur-md shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-3">
            Help us build Edito.ai
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-6 text-sm font-medium leading-relaxed">
            We are currently in active beta and would love to hear your thoughts. If you have feature requests, bugs to report, or just want to say hi, feel free to reach out.
          </p>
          <a
            href="mailto:team@edito.ai"
            className="inline-block px-5 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all duration-300 shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Send Us an Email
          </a>
        </section>
      </div>

      <Footer />
    </div>
  );
}

