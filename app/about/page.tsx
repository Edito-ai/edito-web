import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Code, Heart, MessageSquare } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex-1 w-full bg-background text-text-primary font-body relative overflow-x-clip min-h-screen flex flex-col justify-between">
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] pointer-events-none" />

      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-text-primary mb-6">
            {"We're building the editor we "}
            <span className="text-accent">
              always wanted.
            </span>
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We are a tiny team of creators and developers who got tired of spending hours on repetitive editing tasks—like writing captions, trimming pauses, and formatting transcripts. We built Stedio.ai to put the tedious work on autopilot.
          </p>
        </section>

        {/* Our Story & Beliefs */}
        <section className="py-8 px-6 max-w-5xl mx-auto relative z-10 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold font-display text-text-primary mb-5 tracking-tight">
                Our Story: Why we started this
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed text-[14px]">
                <p>
                  Stedio.ai started as a side project between three friends. We were editing YouTube videos and TikToks on weekends, and noticed how much time we wasted doing the same tedious tasks over and over—transcribing audio, typing captions, and adjusting aspect ratios.
                </p>
                <p>
                  {"We built a few custom scripts to automate those steps for ourselves. When we showed them to other creator friends, they wanted to use them too. That's when we realized this could help a lot more people. We are just starting our journey, and we're committed to making content creation simple and fun."}
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
              <h3 className="text-lg font-bold font-display text-text-primary mb-4">What we believe in</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <Code className="w-4 h-4 text-accent" />,
                    title: "Speed over bloat",
                    desc: "Software should be fast. We avoid heavy features and focus on what you actually use.",
                  },
                  {
                    icon: <Heart className="w-4 h-4 text-accent" />,
                    title: "Built with honesty",
                    desc: "No fake stats, marketing jargon, or over-promising. Just tools that save you time.",
                  },
                  {
                    icon: <MessageSquare className="w-4 h-4 text-accent" />,
                    title: "Open to feedback",
                    desc: "We build in public. If you request a feature or find a bug, we'll fix it directly.",
                  },
                ].map((val, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-background flex items-center justify-center border border-border">
                      {val.icon}
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-semibold text-text-primary">{val.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feedback CTA */}
        <section className="py-16 px-6 max-w-4xl mx-auto text-center relative z-10 mb-20 rounded-2xl border border-border bg-surface shadow-xl">
          <h2 className="text-2xl font-bold font-display text-text-primary mb-3">
            Help us build Stedio.ai
          </h2>
          <p className="text-text-muted max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            We are currently in active beta and would love to hear your thoughts. If you have feature requests, bugs to report, or just want to say hi, feel free to reach out.
          </p>
          <a
            href="mailto:team@stedio.ai"
            className="inline-block px-5 py-2.5 rounded-lg bg-accent text-background font-bold text-xs transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer"
          >
            Send Us an Email
          </a>
        </section>
      </div>

      <Footer />
    </div>
  );
}

