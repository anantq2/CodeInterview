import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  return (
    <div className="h-full overflow-y-auto bg-base-100">
      {/* HEADER */}
      <div className="p-6 border-b border-base-content/5 bg-gradient-to-r from-base-100 to-base-200/30">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{problem.title}</h1>
          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        <p className="text-xs text-base-content/40 font-medium mb-4">{problem.category}</p>

        <select
          className="w-full px-3 py-2 rounded-lg bg-base-content/5 border border-base-content/8 text-sm font-medium focus:border-primary/30 focus:ring-1 focus:ring-primary/10 outline-none transition-all"
          value={currentProblemId}
          onChange={(e) => onProblemChange(e.target.value)}
        >
          {allProblems.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {p.difficulty}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6 space-y-5">
        {/* DESCRIPTION */}
        <div className="rounded-xl bg-base-content/3 border border-base-content/5 p-5">
          <h2 className="text-base font-bold mb-3">Description</h2>
          <div className="space-y-2.5 text-sm leading-relaxed text-base-content/75">
            <p>{problem.description.text}</p>
            {problem.description.notes.map((note, idx) => (
              <p key={idx}>{note}</p>
            ))}
          </div>
        </div>

        {/* EXAMPLES */}
        <div className="rounded-xl bg-base-content/3 border border-base-content/5 p-5">
          <h2 className="text-base font-bold mb-4">Examples</h2>
          <div className="space-y-4">
            {problem.examples.map((example, idx) => (
              <div key={idx}>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/50 mb-2">
                  <span className="size-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                    {idx + 1}
                  </span>
                  Example {idx + 1}
                </span>
                <div className="rounded-lg bg-base-200/50 p-3.5 font-mono text-xs space-y-1.5 border border-base-content/5">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold min-w-[60px]">Input:</span>
                    <span>{example.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-secondary font-bold min-w-[60px]">Output:</span>
                    <span>{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="pt-2 mt-2 border-t border-base-content/5">
                      <span className="text-base-content/50 font-sans text-[11px]">
                        <span className="font-semibold">Explanation: </span>{example.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONSTRAINTS */}
        <div className="rounded-xl bg-base-content/3 border border-base-content/5 p-5">
          <h2 className="text-base font-bold mb-3">Constraints</h2>
          <ul className="space-y-1.5">
            {problem.constraints.map((constraint, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <code className="text-xs text-base-content/70">{constraint}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProblemDescription;
