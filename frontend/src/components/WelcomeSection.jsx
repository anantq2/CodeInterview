import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { motion } from "framer-motion";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden">
      {/* Subtle animated gradient blob */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/8 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-accent/8 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="size-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <SparklesIcon className="size-5 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.firstName || "there"}!
              </h1>
            </div>
            <p className="text-base text-base-content/50 ml-14">
              Ready to level up your coding skills?
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreateSession}
            className="group px-7 py-3.5 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-shadow duration-300"
          >
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <ZapIcon className="size-5" />
              <span>Create Session</span>
              <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
