import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaFilm,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaRoute,
  FaFilter,
} from "react-icons/fa";
import api from "../helper/api";
import Loader from "../components/Loader";
import MovieModal from "../components/MovieModal";
import toast from "react-hot-toast";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all", "watched", "unwatched"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/movies");
      if (res.data.success) {
        setMovies(res.data.movies || []);
      }
    } catch (err) {
      toast.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

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
        fetchMovies();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMovie = async (movie) => {
    if (!window.confirm(`Are you sure you want to remove "${movie.title}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/movies/${movie._id}`);
      if (res.data.success) {
        toast.success("Movie deleted successfully");
        fetchMovies();
      }
    } catch (err) {
      toast.error("Failed to delete movie");
    }
  };

  const openAddModal = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    const matchesSearch = m.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;

    if (filterTab === "watched") return m.watched === true;
    if (filterTab === "unwatched") return m.watched === false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <FaFilm />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              MCU Movie Library
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              {movies.length} films
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Manage MCU titles, release years, runtimes, watched ticks, and prerequisite dependencies.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-red-900/30 transition cursor-pointer"
        >
          <FaPlus />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie by title..."
            className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              filterTab === "all"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => setFilterTab("unwatched")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              filterTab === "unwatched"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Unwatched ({movies.filter((m) => !m.watched).length})
          </button>
          <button
            onClick={() => setFilterTab("watched")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              filterTab === "watched"
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Watched ({movies.filter((m) => m.watched).length})
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <Loader message="Loading MCU films..." />
      ) : filteredMovies.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-10 text-center">
          <FaFilm className="mx-auto text-4xl text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery
              ? `No movies matching "${searchQuery}".`
              : "No movies in this filter category."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
          >
            Add New Movie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className={`rounded-xl border p-5 transition flex flex-col justify-between ${
                movie.watched
                  ? "bg-[#12141D]/60 border-white/5 opacity-80 hover:opacity-100"
                  : "bg-[#12141D] border-white/10 hover:border-red-500/30"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className={`text-base font-bold leading-snug ${
                      movie.watched ? "text-gray-300 line-through" : "text-white"
                    }`}>
                      {movie.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-500 text-[10px]" />
                        {movie.releaseYear}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-gray-500 text-[10px]" />
                        {movie.runtime}m
                      </span>
                    </div>
                  </div>

                  {/* Watched Toggle Button */}
                  <button
                    onClick={() => handleToggleWatched(movie)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer ${
                      movie.watched
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                        : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    <FaCheckCircle className={movie.watched ? "text-emerald-400" : "text-gray-600"} />
                    <span>{movie.watched ? "Watched" : "Unwatched"}</span>
                  </button>
                </div>

                {/* Prerequisites list */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1.5">
                    <span>Prerequisites ({movie.prerequisites?.length || 0}):</span>
                  </div>
                  {movie.prerequisites && movie.prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {movie.prerequisites.map((p) => {
                        const pTitle = typeof p === "object" ? p.title : p;
                        const pWatched = typeof p === "object" ? p.watched : false;
                        return (
                          <span
                            key={typeof p === "object" ? p._id : p}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              pWatched
                                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40 line-through"
                                : "bg-red-950/40 text-red-300 border-red-800/40"
                            }`}
                          >
                            {pTitle}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500 italic">
                      None (Independent film)
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <Link
                  to={`/rewatch?movieId=${movie._id}`}
                  className="flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition"
                >
                  <FaRoute />
                  <span>Plan Rewatch</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(movie)}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition"
                    title="Edit movie"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie)}
                    className="p-1.5 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition"
                    title="Delete movie"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <MovieModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMovies}
        editMovie={editingMovie}
        allMovies={movies}
      />
    </div>
  );
};

export default MoviesPage;
