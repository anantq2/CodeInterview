import { useState } from "react";
import { useNavigate } from "react-router";
import { useJoinByInviteCode } from "../hooks/useSessions";
import { XIcon, KeyRoundIcon, Loader2Icon, ArrowRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

function JoinByCodeModal({ isOpen, onClose }) {
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();
  const joinByCodeMutation = useJoinByInviteCode();

  const handleJoin = () => {
    const code = inviteCode.trim();
    if (!code) {
      toast.error("Please enter an invite code");
      return;
    }

    joinByCodeMutation.mutate(code, {
      onSuccess: (data) => {
        toast.success("Joined session!");
        onClose();
        setInviteCode("");
        navigate(`/session/${data.session._id}`);
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoin();
  };

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
              className="glass-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="join-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-base-content/5">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-gradient-to-br from-warning to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-warning/20">
                    <KeyRoundIcon className="size-4.5 text-white" />
                  </div>
                  <h3 id="join-modal-title" className="text-xl font-bold">Join Private Session</h3>
                </div>
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
                <p className="text-sm text-base-content/60">
                  Enter the invite code shared by your friend to join their private coding session.
                </p>

                {/* Invite Code Input */}
                <div>
                  <label className="text-sm font-semibold text-base-content/70 mb-2 block">
                    Invite Code <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. a1b2c3d4"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-base-200 border border-base-content/8 focus:border-warning/40 focus:ring-2 focus:ring-warning/10 transition-all outline-none text-lg font-mono font-bold tracking-widest text-center text-base-content placeholder:text-base-content/25 placeholder:font-normal placeholder:tracking-normal"
                  />
                </div>
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
                  onClick={handleJoin}
                  disabled={joinByCodeMutation.isPending || !inviteCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-warning to-orange-500 text-white font-semibold text-sm shadow-lg shadow-warning/20 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {joinByCodeMutation.isPending ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="size-4" />
                      Join Session
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default JoinByCodeModal;
