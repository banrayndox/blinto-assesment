import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaRoute,
  FaFilm,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaExclamationTriangle,
  FaListOl,
} from "react-icons/fa";
import api from "../helper/api";
import Loader from "../components/Loader";
import AlgorithmPendingCard from "../components/AlgorithmPendingCard";
import toast from "react-hot-toast";

const RewatchPlannerPage = () => {
  const [searchParams] = useSearchParams();
  const urlMovieId = searchParams.get("movieId");

  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [loadingMovies, setLoadingMovies] = useState(true);

  // Rewatch order states
  const [calculating, setCalculating] = useState(false);
  const [rewatchData, setRewatchData] = useState(null);
  const [isAlgorithmPending, setIsAlgorithmPending] = useState(false);
  const [pendingContext, setPendingContext] = useState(null);

  // Fetch all movies for dropdown
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoadingMovies(true);
        const res = await api.get("/movies");
        if (res.data.success) {
          const list = res.data.movies || [];
          setMovies(list);

          // Select default: urlMovieId or "Avengers: Doomsday" or first movie
          if (urlMovieId && list.some((m) => m._id === urlMovieId)) {
            setSelectedMovieId(urlMovieId);
          } else {
            const doomsday = list.find((m) =>
              m.title.toLowerCase().includes("doomsday")
            );
            if (doomsday) {
              setSelectedMovieId(doomsday._id);
            } else if (list.length > 0) {
              setSelectedMovieId(list[0]._id);
            }
          }
        }
      } catch (err) {
        toast.error("Failed to load movies list");
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [urlMovieId]);

  // Trigger rewatch calculation when selectedMovieId changes
  useEffect(() => {
    if (selectedMovieId) {
      calculateRewatchOrder(selectedMovieId);
    }
  }, [selectedMovieId]);

  const calculateRewatchOrder = async (movieId) => {
    try {
      setCalculating(true);
      setRewatchData(null);
      setIsAlgorithmPending(false);
      setPendingContext(null);

      const res = await api.get(`/movies/${movieId}/rewatch-order`);

      if (res.data.success) {
        setRewatchData(res.data);
      }
    } catch (err) {
      // Check if backend returned 501 / algorithmPending
      const data = err.response?.data;
      if (err.response?.status === 501 || data?.algorithmPending) {
        setIsAlgorithmPending(true);
        setPendingContext(data?.targetMovie || null);
      } else {
        toast.error(data?.message || "Failed to calculate rewatch order");
      }
    } finally {
      setCalculating(false);
    }
  };

  const selectedMovie = movies.find((m) => m._id === selectedMovieId);

  const formatRuntime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleToggleWatchedInList = async (movieItem) => {
    const id = movieItem._id || movieItem.id;
    if (!id) return;
    try {
      const res = await api.patch(`/movies/${id}`, {
        watched: !movieItem.watched,
      });
      if (res.data.success) {
        toast.success(`Updated "${movieItem.title}"`);
        // Refresh rewatch calculation
        calculateRewatchOrder(selectedMovieId);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loadingMovies) {
    return <Loader message="Loading MCU films for planner..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <FaRoute />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              Doomsday Rewatch Planner
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Select a target MCU movie to trace its prerequisite dependency tree in optimal watch order.
          </p>
        </div>
      </div>

      {/* Target Movie Selector Bar */}
      <div className="rounded-xl border border-white/10 bg-[#12141D] p-5 shadow-lg">
        <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
          Select Target MCU Film:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {movies.map((m) => (
              <option key={m._id} value={m._id} className="bg-[#12141D] text-white">
                {m.title} ({m.releaseYear}) — {m.runtime} mins
              </option>
            ))}
          </select>

          <button
            onClick={() => calculateRewatchOrder(selectedMovieId)}
            disabled={calculating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
          >
            <FaPlay className="text-[10px]" />
            <span>{calculating ? "Calculating..." : "Calculate Rewatch"}</span>
          </button>
        </div>

        {selectedMovie && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5 text-white">
              <FaFilm className="text-red-500" />
              Target: <strong className="text-white font-sans">{selectedMovie.title}</strong>
            </span>
            <span>•</span>
            <span>Year: {selectedMovie.releaseYear}</span>
            <span>•</span>
            <span>Runtime: {selectedMovie.runtime}m</span>
            <span>•</span>
            <span>
              Direct Prereqs:{" "}
              <strong className="text-red-400">
                {selectedMovie.prerequisites?.length || 0} films
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Results Container */}
      {calculating ? (
        <Loader message="Querying GET /api/movies/:id/rewatch-order..." />
      ) : isAlgorithmPending ? (
        /* Graceful Algorithm Pending UI */
        <AlgorithmPendingCard
          title="Rewatch Order & Dependency Graph Traversal"
          featureNumber="1"
          description="The frontend successfully requested the rewatch sequence from GET /api/movies/:id/rewatch-order. As specified in the assessment requirements, the topological sorting, circular dependency check, watched count calculation, and remaining runtime algorithms are reserved for you to write in Express."
          reservedFile="backend/src/controllers/movieController.js -> getRewatchOrder"
          contextData={pendingContext}
          expectedFormat={`{
  "success": true,
  "target": "${selectedMovie?.title || "Avengers: Doomsday"}",
  "totalMovies": 7,
  "watchedCount": 3,
  "remainingRuntime": 622,
  "movies": [
    { "title": "Iron Man", "releaseYear": 2008, "runtime": 126, "watched": true },
    { "title": "Captain America: The First Avenger", "releaseYear": 2011, "runtime": 124, "watched": true },
    { "title": "The Avengers", "releaseYear": 2012, "runtime": 143, "watched": true },
    ...
  ]
}`}
          onRetry={() => calculateRewatchOrder(selectedMovieId)}
        />
      ) : rewatchData ? (
        /* Implemented Algorithm Output Display */
        <div className="space-y-6">
          {/* Summary Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#12141D] p-5">
              <span className="text-xs font-mono uppercase text-gray-400">
                Prerequisites Required
              </span>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {rewatchData.movies?.length || rewatchData.totalMovies || 0} films
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12141D] p-5">
              <span className="text-xs font-mono uppercase text-gray-400">
                Watched Progress
              </span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                {rewatchData.watchedCount || 0} /{" "}
                {rewatchData.movies?.length || rewatchData.totalMovies || 0} watched
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{
                    width: `${
                      rewatchData.movies?.length
                        ? Math.round(
                            ((rewatchData.watchedCount || 0) /
                              rewatchData.movies.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12141D] p-5">
              <span className="text-xs font-mono uppercase text-gray-400">
                Remaining Unwatched Runtime
              </span>
              <div className="mt-2 text-2xl font-extrabold text-blue-400">
                {formatRuntime(rewatchData.remainingRuntime || 0)}
              </div>
            </div>
          </div>

          {/* Ordered Timeline List */}
          <div className="rounded-xl border border-white/10 bg-[#12141D] p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/10">
              <FaListOl className="text-red-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Ordered Rewatch Sequence (Topological Order)
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              {(rewatchData.movies || []).map((m, idx) => (
                <div
                  key={m._id || idx}
                  className={`flex items-center justify-between p-4 rounded-xl border transition ${
                    m.watched
                      ? "bg-black/30 border-white/5 opacity-75"
                      : "bg-white/[0.02] border-white/10 hover:border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-700/60 flex items-center justify-center text-xs font-mono font-bold text-red-400 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          m.watched ? "text-gray-400 line-through" : "text-white"
                        }`}
                      >
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-0.5">
                        <span>{m.releaseYear}</span>
                        <span>•</span>
                        <span>{m.runtime} mins</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleWatchedInList(m)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                      m.watched
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                        : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <FaCheckCircle
                      className={m.watched ? "text-emerald-400" : "text-gray-600"}
                    />
                    <span>{m.watched ? "Watched" : "Mark Watched"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-10 text-center text-gray-400 text-sm">
          Select a movie above and click "Calculate Rewatch" to fetch the sequence.
        </div>
      )}
    </div>
  );
};

export default RewatchPlannerPage;
