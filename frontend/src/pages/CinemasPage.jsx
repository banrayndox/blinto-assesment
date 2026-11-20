import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaPlus,
  FaTicketAlt,
  FaEdit,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import api from "../helper/api";
import Loader from "../components/Loader";
import CinemaModal from "../components/CinemaModal";
import toast from "react-hot-toast";

const CinemasPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cinemas");
      if (res.data.success) {
        setCinemas(res.data.cinemas || []);
      }
    } catch (err) {
      toast.error("Failed to load cinemas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const openAddModal = () => {
    setEditingCinema(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cinema) => {
    setEditingCinema(cinema);
    setIsModalOpen(true);
  };

  const handleDeleteCinema = async (cinema) => {
    if (!window.confirm(`Are you sure you want to delete "${cinema.name}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/cinemas/${cinema._id}`);
      if (res.data.success) {
        toast.success("Cinema deleted successfully");
        fetchCinemas();
      }
    } catch (err) {
      toast.error("Failed to delete cinema");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <FaBuilding />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              Partner Cinemas
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              {cinemas.length} venues
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Cinemas selling opening-night tickets in fixed seat bundles for watch parties.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-red-900/30 transition cursor-pointer"
        >
          <FaPlus />
          <span>Add Cinema</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <Loader message="Loading partner cinemas..." />
      ) : cinemas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-10 text-center">
          <FaBuilding className="mx-auto text-4xl text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-white">No Cinemas Registered</h3>
          <p className="text-xs text-gray-400 mt-1">
            Add your first cinema venue and configure opening night bundle sizes.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
          >
            Add New Cinema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="rounded-xl border border-white/10 bg-[#12141D] p-5 hover:border-amber-500/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {cinema.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">
                      {cinema.bundleSizes?.length || 0} bundle tier
                      {cinema.bundleSizes?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <FaUsers className="text-xs" />
                  </div>
                </div>

                {/* Bundle sizes chips */}
                <div className="mt-4 pt-3 border-t border-white/5">
                  <span className="text-[11px] font-mono text-gray-400 block mb-2">
                    Available Bundle Capacities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(cinema.bundleSizes || []).map((size) => (
                      <span
                        key={size}
                        className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white text-xs font-mono font-medium"
                      >
                        {size} seats
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
                <Link
                  to={`/booking?cinemaId=${cinema._id}`}
                  className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 transition"
                >
                  <FaTicketAlt />
                  <span>Book Watch Party</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cinema)}
                    className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition"
                    title="Edit cinema"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDeleteCinema(cinema)}
                    className="p-1.5 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition"
                    title="Delete cinema"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CinemaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCinemas}
        editCinema={editingCinema}
      />
    </div>
  );
};

export default CinemasPage;
