import { PROBLEMS } from "../data/problems";
import { getDifficultyBadgeClass } from "../lib/utils";
import { PlusIcon, XIcon, Code2Icon, UsersIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const selectedProblem = Object.values(PROBLEMS).find(
    (p) => p.title === roomConfig.problem
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-base-content/5">
                <h3 id="modal-title" className="text-xl font-bold">Create New Session</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="size-8 rounded-lg bg-base-content/5 hover:bg-base-content/10 flex items-center justify-center transition-colors"
                >
                  <XIcon className="size-4" />
                </motion.button>
              </div>

              <div className="p-6 space-y-5">
                {/* Problem Selector */}
                <div>
                  <label className="text-sm font-semibold text-base-content/70 mb-2 block">
                    Select Problem <span className="text-error">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-base-200 border border-base-content/8 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium text-base-content"
                    value={roomConfig.problem}
                    onChange={(e) => {
                      const problem = Object.values(PROBLEMS).find(
                        (p) => p.title === e.target.value
                      );
                      setRoomConfig({
                        problem: e.target.value,
                        difficulty: problem?.difficulty || "",
                      });
                    }}
                  >
                    <option value="" className="bg-base-200 text-base-content">Choose a problem...</option>
                    {Object.values(PROBLEMS).map((problem) => (
                      <option key={problem.id} value={problem.title} className="bg-base-200 text-base-content">
                        {problem.title} ({problem.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Summary */}
                {selectedProblem && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl bg-gradient-to-br from-primary/8 via-secondary/5 to-accent/8 border border-primary/15 p-4"
                  >
                    <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-3">Room Summary</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <Code2Icon className="size-4 text-primary" />
                        <span className="text-sm font-medium">Problem: {selectedProblem.title}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <UsersIcon className="size-4 text-secondary" />
                        <span className="text-sm font-medium">Max Participants: 2 (1-on-1 session)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-base-content/5">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-content/5 transition-all duration-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onCreateRoom}
                  disabled={isCreating || !roomConfig.problem}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  <PlusIcon className="size-4" />
                  {isCreating ? "Creating..." : "Create"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CreateSessionModal;
