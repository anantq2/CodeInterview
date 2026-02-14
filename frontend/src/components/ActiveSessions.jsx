import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
} from "lucide-react";
import { Link } from "react-router";
import { getDifficultyBadgeClass } from "../lib/utils";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  return (
    <div className="lg:col-span-2 glass-card rounded-2xl gradient-border h-full">
      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ZapIcon className="size-4.5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Live Sessions</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10">
            <span className="relative size-2 bg-success rounded-full pulse-ring" />
            <span className="text-xs font-bold text-success">{sessions.length} active</span>
          </div>
        </div>

        {/* SESSIONS LIST */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoaderIcon className="size-8 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session, i) => (
              <motion.div
                key={session._id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="group rounded-xl bg-base-content/3 hover:bg-base-content/5 border border-base-content/5 hover:border-primary/20 p-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative size-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <Code2Icon className="size-6 text-white" />
                      <div className="absolute -top-1 -right-1 size-3.5 bg-success rounded-full border-2 border-base-100" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-bold truncate">{session.problem}</h3>
                        <span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>
                          {session.difficulty.slice(0, 1).toUpperCase() + session.difficulty.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3.5 text-xs text-base-content/50">
                        <span className="flex items-center gap-1">
                          <CrownIcon className="size-3.5" />
                          <span className="font-medium">{session.host?.name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="size-3.5" />
                          {session.participant ? "2/2" : "1/2"}
                        </span>
                        {session.participant && !isUserInSession(session) ? (
                          <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">FULL</span>
                        ) : (
                          <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">OPEN</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {session.participant && !isUserInSession(session) ? (
                    <button className="btn btn-sm btn-disabled opacity-50" disabled>Full</button>
                  ) : (
                    <Link
                      to={`/session/${session._id}`}
                      className="shrink-0 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-sm transition-all duration-300 flex items-center gap-1.5"
                    >
                      {isUserInSession(session) ? "Rejoin" : "Join"}
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="size-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="size-8 text-primary/40" />
              </div>
              <p className="text-sm font-semibold text-base-content/50 mb-1">No active sessions</p>
              <p className="text-xs text-base-content/35">Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ActiveSessions;
