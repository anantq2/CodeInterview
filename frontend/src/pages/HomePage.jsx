import { Link } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  ShieldCheckIcon,
  GlobeIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedCounter({ value, suffix = "" }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
    >
      {value}{suffix}
    </motion.span>
  );
}

const FEATURES = [
  {
    icon: VideoIcon,
    title: "HD Video Calls",
    desc: "Crystal-clear video and audio for seamless face-to-face interviews",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Code2Icon,
    title: "Live Code Editor",
    desc: "Collaborate in real-time with Monaco Editor, syntax highlighting, and multi-language support",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: UsersIcon,
    title: "Pair Programming",
    desc: "Share your screen, discuss solutions, and learn together in real-time",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: ShieldCheckIcon,
    title: "Sandboxed Execution",
    desc: "Run code safely in isolated containers — no local setup needed",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: GlobeIcon,
    title: "Multi-Language",
    desc: "JavaScript, Python, Java, and more — pick your weapon of choice",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    icon: ZapIcon,
    title: "Instant Feedback",
    desc: "Auto test-case validation with confetti celebrations on success",
    gradient: "from-indigo-500 to-blue-400",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen animated-gradient-bg overflow-hidden">
      {/* NAVBAR */}
      <nav className="glass-navbar sticky top-0 z-50 shadow-lg" aria-label="Home navigation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <SparklesIcon className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
                CodeInterview
              </span>
              <span className="text-[10px] text-base-content/50 font-medium -mt-0.5 tracking-wider uppercase">
                Code Together
              </span>
            </div>
          </Link>

          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group px-6 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </SignInButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28">
        {/* Dot grid pattern */}
        <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <ZapIcon className="size-3.5" />
                Real-time Collaboration
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Code Together,
              </span>
              <br />
              <span className="text-base-content">Learn Together</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-base-content/60 leading-relaxed max-w-xl"
            >
              The ultimate platform for collaborative coding interviews and pair programming.
              Connect face-to-face, code in real-time, and ace your technical interviews.
            </motion.p>

            {/* Feature pills */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-2.5">
              {["Live Video Chat", "Code Editor", "Multi-Language"].map((text) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20"
                >
                  <CheckIcon className="size-3.5" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 pt-2">
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 flex items-center gap-2.5"
                >
                  Start Coding Now
                  <ArrowRightIcon className="size-5" />
                </motion.button>
              </SignInButton>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold border-2 border-base-content/15 text-base-content/80 hover:border-primary/40 hover:text-primary transition-colors duration-300 flex items-center gap-2.5"
              >
                <VideoIcon className="size-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* STATS */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="flex gap-8 pt-4"
            >
              {[
                { value: "10K", suffix: "+", label: "Active Users", color: "text-primary" },
                { value: "50K", suffix: "+", label: "Sessions", color: "text-secondary" },
                { value: "99.9", suffix: "%", label: "Uptime", color: "text-accent" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-black ${stat.color}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-base-content/50 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 rounded-3xl blur-2xl" />
              <img
                src="/hero.png"
                alt="CodeInterview Platform"
                className="relative w-full h-auto rounded-2xl shadow-2xl border border-base-content/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4 tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-base text-base-content/50 max-w-2xl mx-auto">
            Powerful features designed to make your coding interviews seamless and productive
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="glass-card rounded-2xl p-6 card-hover group"
              >
                <div className={`size-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="size-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-base-content/55 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-content/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-base-content/40">
          <span>© 2025 CodeInterview. Built for learners.</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default HomePage;
