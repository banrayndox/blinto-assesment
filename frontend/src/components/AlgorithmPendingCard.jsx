import React from "react";
import { FaCode, FaFlask, FaRedo, FaInfoCircle } from "react-icons/fa";

const AlgorithmPendingCard = ({
  title,
  featureNumber,
  description,
  reservedFile,
  contextData,
  expectedFormat,
  onRetry,
}) => {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-black/40 to-black/60 p-6 backdrop-blur-md shadow-2xl shadow-amber-950/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <FaFlask className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Feature {featureNumber} Logic
              </span>
              <span className="text-xs font-mono text-gray-400">
                Reserved for User Implementation
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition cursor-pointer"
          >
            <FaRedo className="text-xs" />
            <span>Re-check API</span>
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-300 leading-relaxed">
        {description}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg bg-black/60 border border-white/5 p-3.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
            <FaCode />
            <span>Target Implementation File:</span>
          </div>
          <code className="text-gray-200 break-all select-all bg-white/5 px-2 py-1 rounded block">
            {reservedFile}
          </code>
          {contextData && (
            <div className="mt-3">
              <span className="text-gray-400 block mb-1">Received Parameters:</span>
              <pre className="text-emerald-400 overflow-x-auto p-2 bg-black/70 rounded text-[11px] max-h-32">
                {JSON.stringify(contextData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-black/60 border border-white/5 p-3.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
            <FaInfoCircle />
            <span>Expected API Output Format:</span>
          </div>
          <pre className="text-gray-300 overflow-x-auto p-2 bg-black/70 rounded text-[11px] max-h-44">
            {expectedFormat}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPendingCard;
