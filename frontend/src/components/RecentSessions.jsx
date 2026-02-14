import { Code2, Clock, Users, Trophy, Loader } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function RecentSessions({ sessions, isLoading }) {
  return (
    <div className="glass-card rounded-2xl gradient-border mt-6">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-9 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Clock className="size-4.5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Your Past Sessions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader className="size-8 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session, i) => (
              <motion.div
                key={session._id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                className={`rounded-xl p-5 transition-all duration-300 ${session.status === "active"
                    ? "bg-success/5 border border-success/20 glow-success"
                    : "bg-base-content/3 border border-base-content/5 hover:border-primary/15"
                  }`}
              >
                {session.status === "active" && (
                  <div className="flex justify-end mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
                      <span className="size-1.5 bg-success rounded-full animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${session.status === "active"
                      ? "bg-gradient-to-br from-success to-success/70"
                      : "bg-gradient-to-br from-primary to-secondary"
                    }`}>
                    <Code2 className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1.5 truncate">{session.problem}</h3>
                    <span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-base-content/45 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5" />
                    <span>{session.participant ? "2" : "1"} participant{session.participant ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-base-content/5">
                  <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Completed</span>
                  <span className="text-[10px] text-base-content/30">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="size-16 mx-auto mb-4 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                <Trophy className="size-8 text-accent/40" />
              </div>
              <p className="text-sm font-semibold text-base-content/50 mb-1">No sessions yet</p>
              <p className="text-xs text-base-content/35">Start your coding journey today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentSessions;
