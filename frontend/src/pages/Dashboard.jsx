import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaCheckCircle,
  FaClock,
  FaBuilding,
  FaRoute,
  FaTicketAlt,
  FaPlus,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../helper/api";
import Loader from "../components/Loader";
import MovieModal from "../components/MovieModal";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesRes, cinemasRes] = await Promise.all([
        api.get("/movies"),
        api.get("/cinemas"),
      ]);
      if (moviesRes.data.success) {
        setMovies(moviesRes.data.movies || []);
      }
      if (cinemasRes.data.success) {
        setCinemas(cinemasRes.data.cinemas || []);
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMovies = movies.length;
  const watchedMovies = movies.filter((m) => m.watched).length;
  const unwatchedMovies = totalMovies - watchedMovies;
  const watchProgress = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;
  const totalRuntimeMinutes = movies.reduce((acc, m) => acc + (m.runtime || 0), 0);
  const unwatchedRuntimeMinutes = movies
    .filter((m) => !m.watched)
    .reduce((acc, m) => acc + (m.runtime || 0), 0);

  const formatRuntime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleToggleWatched = async (movie) => {
    try {
      const res = await api.patch(`/movies/${movie._id}`, {
        watched: !movie.watched,
      });
      if (res.data.success) {
        toast.success(
          !movie.watched
            ? `Marked "${movie.title}" as watched!`
            : `Marked "${movie.title}" as unwatched!`
        );
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <Loader message="Initializing MCU Mission Control..." />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/40 via-black/80 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-red-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-wider mb-3">
            <FaShieldAlt />
            <span>Avengers: Doomsday Rewatch Mission</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
            Prepare For <span className="text-red-500">Doomsday</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
            Earth’s mightiest heroes face their greatest reckoning. Map predecessor movie prerequisites, calculate your optimal catch-up sequence, and organize opening-night watch parties with perfect group seat bundles.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/rewatch"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-red-900/40 transition"
            >
              <FaRoute />
              <span>Plan Rewatch Order</span>
            </Link>

            <Link
              to="/booking"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              <FaTicketAlt />
              <span>Book Group Watch Party</span>
            </Link>

            <button
              onClick={() => setIsMovieModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/40 hover:bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer"
            >
              <FaPlus className="text-red-500" />
              <span>Add Film</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-5 shadow-lg relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Total MCU Movies</span>
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <FaFilm />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalMovies}</span>
            <span className="text-xs text-gray-500 font-mono">tracked</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {unwatchedMovies} unwatched prerequisites
          </p>
        </div>

        {/* Watched Progress */}
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Watched Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <FaCheckCircle />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{watchedMovies}</span>
            <span className="text-xs text-emerald-400 font-mono">/ {totalMovies} ({watchProgress}%)</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${watchProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Rewatch Runtime */}
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Rewatch Runtime</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FaClock />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{formatRuntime(unwatchedRuntimeMinutes)}</span>
            <span className="text-xs text-gray-500 font-mono">remaining</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {formatRuntime(totalRuntimeMinutes)} total MCU runtime
          </p>
        </div>

        {/* Partner Cinemas */}
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400">Partner Cinemas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <FaBuilding />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{cinemas.length}</span>
            <span className="text-xs text-gray-500 font-mono">venues</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Opening-night group seat bundles
          </p>
        </div>
      </div>

      {/* Recent MCU Timeline & Quick Ticks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movie Quick List */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#12141D] p-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FaFilm className="text-red-500 text-sm" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                MCU Movies Quick Tracker
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <span>View all ({totalMovies})</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {movies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No movies added to the universe yet.</p>
                <button
                  onClick={() => setIsMovieModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-medium"
                >
                  Add First Movie
                </button>
              </div>
            ) : (
              movies.slice(0, 6).map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 transition"
                >
                  <div className="flex items-center gap-3 truncate mr-2">
                    <button
                      onClick={() => handleToggleWatched(m)}
                      title={m.watched ? "Mark as unwatched" : "Mark as watched"}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer shrink-0 ${
                        m.watched
                          ? "bg-emerald-600 text-white"
                          : "border border-gray-600 text-transparent hover:border-gray-400"
                      }`}
                    >
                      <FaCheckCircle />
                    </button>
                    <div className="truncate">
                      <span className={`text-sm font-medium ${m.watched ? "text-gray-400 line-through" : "text-white"}`}>
                        {m.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                        <span>{m.releaseYear}</span>
                        <span>•</span>
                        <span>{m.runtime} mins</span>
                        {m.prerequisites && m.prerequisites.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-400">{m.prerequisites.length} prereqs</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/rewatch?movieId=${m._id}`}
                    className="shrink-0 px-2.5 py-1 rounded bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 border border-white/5 text-[11px] font-mono transition"
                  >
                    Rewatch Plan
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launch & Information */}
        <div className="space-y-6">
          {/* Rewatch Guide Quick Card */}
          <div className="rounded-xl border border-red-900/30 bg-gradient-to-b from-red-950/20 to-black/60 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FaRoute className="text-red-500" />
              <span>Rewatch Sequence</span>
            </h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Target any movie to trace its dependency tree. The API endpoint handles topological rewatch sequencing to ensure prerequisites are satisfied.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">Target: Doomsday</span>
              <Link
                to="/rewatch"
                className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <span>Launch Planner</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>

          {/* Group Ticket Party Card */}
          <div className="rounded-xl border border-blue-900/30 bg-gradient-to-b from-blue-950/20 to-black/60 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FaTicketAlt className="text-blue-500" />
              <span>Watch-Party Seat Bundles</span>
            </h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Opening night cinemas sell seats strictly in bundle batches. Calculate the exact minimum bundles to seat groups up to 10,000 fans.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">{cinemas.length} Cinemas Active</span>
              <Link
                to="/booking"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Book Seats</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Movie Modal */}
      <MovieModal
        isOpen={isMovieModalOpen}
        onClose={() => setIsMovieModalOpen(false)}
        onSuccess={fetchData}
        allMovies={movies}
      />
    </div>
  );
};

export default Dashboard;
