import React, { useState, useEffect } from "react";
import { FaTimes, FaFilm, FaCalendarAlt, FaClock, FaCheck, FaExclamationCircle } from "react-icons/fa";
import api from "../helper/api";
import toast from "react-hot-toast";

const MovieModal = ({ isOpen, onClose, onSuccess, editMovie = null, allMovies = [] }) => {
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [runtime, setRuntime] = useState(120);
  const [watched, setWatched] = useState(false);
  const [selectedPrereqs, setSelectedPrereqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editMovie) {
      setTitle(editMovie.title || "");
      setReleaseYear(editMovie.releaseYear || 2024);
      setRuntime(editMovie.runtime || 120);
      setWatched(Boolean(editMovie.watched));
      const prereqIds = (editMovie.prerequisites || []).map((p) =>
        typeof p === "object" ? p._id : p
      );
      setSelectedPrereqs(prereqIds);
    } else {
      setTitle("");
      setReleaseYear(2026);
      setRuntime(120);
      setWatched(false);
      setSelectedPrereqs([]);
    }
    setErrorMsg("");
  }, [editMovie, isOpen]);

  if (!isOpen) return null;

  // Filter out the current movie being edited from potential prerequisites
  const availablePrereqs = allMovies.filter(
    (m) => !editMovie || m._id !== editMovie._id
  );

  const togglePrereq = (id) => {
    if (selectedPrereqs.includes(id)) {
      setSelectedPrereqs(selectedPrereqs.filter((pId) => pId !== id));
    } else {
      setSelectedPrereqs([...selectedPrereqs, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Movie title is required");
      return;
    }
    if (!releaseYear) {
      setErrorMsg("Release year is required");
      return;
    }
    if (!runtime || runtime < 1 || runtime > 300) {
      setErrorMsg("Runtime must be between 1 and 300 minutes");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        releaseYear: Number(releaseYear),
        runtime: Number(runtime),
        watched: Boolean(watched),
        prerequisites: selectedPrereqs,
      };

      if (editMovie) {
        const res = await api.patch(`/movies/${editMovie._id}`, payload);
        if (res.data.success) {
          toast.success("Movie updated successfully!");
          onSuccess();
          onClose();
        }
      } else {
        const res = await api.post("/movies", payload);
        if (res.data.success) {
          toast.success("Movie created successfully!");
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save movie";
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
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12141D] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <FaFilm />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {editMovie ? "Edit MCU Movie" : "Add New MCU Movie"}
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
              Movie Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Avengers: Doomsday"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FaCalendarAlt className="text-gray-500" />
                Release Year *
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                min="1990"
                max="2040"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FaClock className="text-gray-500" />
                Runtime (min) *
              </label>
              <input
                type="number"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                min="1"
                max="300"
                placeholder="1–300"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Watched Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <input
              type="checkbox"
              id="watchedStatus"
              checked={watched}
              onChange={(e) => setWatched(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
            <label htmlFor="watchedStatus" className="text-sm font-medium text-gray-200 cursor-pointer">
              Mark this movie as already watched
            </label>
          </div>

          {/* Prerequisites Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
              Prerequisites (Movies to watch first)
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              Select all predecessor films required before watching this one:
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-black/40 border border-white/10">
              {availablePrereqs.length === 0 ? (
                <p className="text-xs text-gray-400 p-2 text-center">
                  No other movies available yet.
                </p>
              ) : (
                availablePrereqs.map((m) => {
                  const isSelected = selectedPrereqs.includes(m._id);
                  return (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => togglePrereq(m._id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-red-950/60 border border-red-700/60 text-white font-medium"
                          : "bg-white/[0.02] hover:bg-white/5 text-gray-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${isSelected ? "bg-red-600 text-white" : "border border-gray-600"}`}>
                          {isSelected && <FaCheck />}
                        </span>
                        <span className="truncate">{m.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                        {m.releaseYear} • {m.runtime}m
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Buttons */}
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
              {loading ? "Saving..." : editMovie ? "Update Movie" : "Create Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieModal;
