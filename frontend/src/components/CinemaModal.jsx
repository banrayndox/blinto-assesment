import React, { useState, useEffect } from "react";
import { FaTimes, FaBuilding, FaPlus, FaTrash, FaExclamationCircle } from "react-icons/fa";
import api from "../helper/api";
import toast from "react-hot-toast";

const CinemaModal = ({ isOpen, onClose, onSuccess, editCinema = null }) => {
  const [name, setName] = useState("");
  const [bundleSizes, setBundleSizes] = useState([5, 2]);
  const [newSizeInput, setNewSizeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editCinema) {
      setName(editCinema.name || "");
      setBundleSizes(editCinema.bundleSizes || [5, 2]);
    } else {
      setName("");
      setBundleSizes([20, 9, 6]);
    }
    setNewSizeInput("");
    setErrorMsg("");
  }, [editCinema, isOpen]);

  if (!isOpen) return null;

  const handleAddBundle = () => {
    const val = parseInt(newSizeInput, 10);
    if (isNaN(val)) return;

    if (val < 1 || val > 500) {
      setErrorMsg("Bundle size must be between 1 and 500 seats");
      return;
    }
    if (bundleSizes.includes(val)) {
      setErrorMsg("This bundle size is already added");
      return;
    }
    if (bundleSizes.length >= 10) {
      setErrorMsg("A cinema cannot have more than 10 bundle sizes");
      return;
    }

    setBundleSizes([...bundleSizes, val].sort((a, b) => b - a));
    setNewSizeInput("");
    setErrorMsg("");
  };

  const handleRemoveBundle = (sizeToRemove) => {
    if (bundleSizes.length <= 1) {
      setErrorMsg("A cinema must have at least 1 bundle size");
      return;
    }
    setBundleSizes(bundleSizes.filter((s) => s !== sizeToRemove));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Cinema name is required");
      return;
    }
    if (bundleSizes.length < 1 || bundleSizes.length > 10) {
      setErrorMsg("A cinema must have between 1 and 10 bundle sizes");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        bundleSizes,
      };

      if (editCinema) {
        const res = await api.patch(`/cinemas/${editCinema._id}`, payload);
        if (res.data.success) {
          toast.success("Cinema updated successfully!");
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post("/cinemas", payload);
        if (res.data.success) {
          toast.success("Cinema created successfully!");
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save cinema";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12141D] p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <FaBuilding />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {editCinema ? "Edit Cinema" : "Add New Cinema"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <FaTimes />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <FaExclamationCircle className="shrink-0 text-sm" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
              Cinema Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stark Avengers Multiplex"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase text-gray-400">
                Opening-Night Bundle Sizes (1–10) *
              </label>
              <span className="text-[11px] font-mono text-gray-400">
                {bundleSizes.length}/10 sizes
              </span>
            </div>

            {/* Bundle Chips */}
            <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/40 border border-white/10 min-h-[52px] items-center">
              {bundleSizes.map((size) => (
                <span
                  key={size}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-200 text-xs font-mono font-medium shadow-sm"
                >
                  <span>{size} seats</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBundle(size)}
                    className="hover:text-red-400 transition ml-0.5"
                    title="Remove bundle"
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Bundle Input */}
            <div className="flex gap-2 mt-2.5">
              <input
                type="number"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBundle();
                  }
                }}
                min="1"
                max="500"
                placeholder="Bundle capacity (1-500)"
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBundle}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition cursor-pointer"
              >
                <FaPlus className="text-[10px]" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick presets */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">Presets:</span>
              <button
                type="button"
                onClick={() => setBundleSizes([20, 9, 6])}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
              >
                [20, 9, 6]
              </button>
              <button
                type="button"
                onClick={() => setBundleSizes([5, 2])}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
              >
                [5, 2]
              </button>
              <button
                type="button"
                onClick={() => setBundleSizes([4, 3, 1])}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300"
              >
                [4, 3, 1]
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-wide shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : editCinema ? "Update Cinema" : "Create Cinema"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CinemaModal;
