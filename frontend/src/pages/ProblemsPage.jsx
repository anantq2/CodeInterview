import { Link } from "react-router";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/problems";
import { ChevronRightIcon, Code2Icon, TargetIcon, FlameIcon, SkullIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ProblemsPage() {
  const problems = Object.values(PROBLEMS);

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen animated-gradient-bg">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black mb-2 tracking-tight">Practice Problems</h1>
          <p className="text-base-content/50">
            Sharpen your coding skills with these curated problems
          </p>
        </motion.div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
        >
          {[
            { label: "Total", count: problems.length, color: "text-primary", icon: Code2Icon },
            { label: "Easy", count: easyProblemsCount, color: "text-success", icon: TargetIcon },
            { label: "Medium", count: mediumProblemsCount, color: "text-warning", icon: FlameIcon },
            { label: "Hard", count: hardProblemsCount, color: "text-error", icon: SkullIcon },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <stat.icon className={`size-5 mx-auto mb-2 ${stat.color}`} />
              <div className={`text-2xl font-black ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-base-content/40 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* PROBLEMS LIST */}
        <div className="space-y-3">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Link
                to={`/problem/${problem.id}`}
                className="group block glass-card rounded-xl card-hover overflow-hidden"
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Icon */}
                  <div className="size-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Code2Icon className="size-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h2 className="text-base font-bold truncate">{problem.title}</h2>
                      <span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/40 font-medium">{problem.category}</p>
                    <p className="text-sm text-base-content/55 mt-1.5 line-clamp-1">{problem.description.text}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                    <span className="text-sm font-semibold">Solve</span>
                    <ChevronRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
