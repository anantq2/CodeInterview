import { TrophyIcon, UsersIcon } from "lucide-react";
import { motion } from "framer-motion";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-5">
      {/* Active Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-2xl p-6 card-hover gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="size-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <UsersIcon className="size-6 text-white" />
          </div>
          <span className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
            <span className="relative size-2 bg-success rounded-full pulse-ring" />
            Live
          </span>
        </div>
        <motion.div
          className="text-4xl font-black mb-1"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          {activeSessionsCount}
        </motion.div>
        <div className="text-sm text-base-content/45 font-medium">Active Sessions</div>
      </motion.div>

      {/* Recent Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-2xl p-6 card-hover gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="size-12 bg-gradient-to-br from-secondary to-secondary/60 rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
            <TrophyIcon className="size-6 text-white" />
          </div>
        </div>
        <motion.div
          className="text-4xl font-black mb-1"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
        >
          {recentSessionsCount}
        </motion.div>
        <div className="text-sm text-base-content/45 font-medium">Total Sessions</div>
      </motion.div>
    </div>
  );
}

export default StatsCards;
