import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaTicketAlt,
  FaBuilding,
  FaUsers,
  FaCalculator,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
} from "react-icons/fa";
import api from "../helper/api";
import Loader from "../components/Loader";
import AlgorithmPendingCard from "../components/AlgorithmPendingCard";
import toast from "react-hot-toast";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const urlCinemaId = searchParams.get("cinemaId");

  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState(6);
  const [loadingCinemas, setLoadingCinemas] = useState(true);

  // Quote states
  const [calculating, setCalculating] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const [isAlgorithmPending, setIsAlgorithmPending] = useState(false);
  const [pendingContext, setPendingContext] = useState(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoadingCinemas(true);
        const res = await api.get("/cinemas");
        if (res.data.success) {
          const list = res.data.cinemas || [];
          setCinemas(list);

          if (urlCinemaId && list.some((c) => c._id === urlCinemaId)) {
            setSelectedCinemaId(urlCinemaId);
          } else if (list.length > 0) {
            setSelectedCinemaId(list[0]._id);
          }
        }
      } catch (err) {
        toast.error("Failed to load cinemas");
      } finally {
        setLoadingCinemas(false);
      }
    };

    fetchCinemas();
  }, [urlCinemaId]);

  const selectedCinema = cinemas.find((c) => c._id === selectedCinemaId);

  const handleGetQuote = async (e) => {
    if (e) e.preventDefault();

    if (!selectedCinemaId) {
      toast.error("Please select a cinema");
      return;
    }

    const size = Number(groupSize);
    if (!size || size < 1 || size > 10000) {
      toast.error("Group size must be between 1 and 10,000");
      return;
    }

    try {
      setCalculating(true);
      setQuoteResult(null);
      setIsAlgorithmPending(false);
      setPendingContext(null);

      const res = await api.get(`/cinemas/${selectedCinemaId}/booking`, {
        params: { groupSize: size },
      });

      if (res.data) {
        setQuoteResult(res.data);
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 501 || data?.algorithmPending) {
        setIsAlgorithmPending(true);
        setPendingContext({
          cinema: data?.cinema || {
            name: selectedCinema?.name,
            bundleSizes: selectedCinema?.bundleSizes,
          },
          groupSize: size,
        });
      } else {
        toast.error(data?.message || "Failed to calculate booking quote");
      }
    } finally {
      setCalculating(false);
    }
  };

  const presetSizes = [6, 7, 11, 44, 100];

  if (loadingCinemas) {
    return <Loader message="Loading cinema booking system..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <FaTicketAlt />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              Watch-Party Group Booking
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Find the minimum bundle combination to seat your opening-night group with zero empty seats.
          </p>
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="rounded-xl border border-white/10 bg-[#12141D] p-6 shadow-lg">
        <form onSubmit={handleGetQuote} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cinema Dropdown */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FaBuilding className="text-gray-500" />
                Select Cinema Venue *
              </label>
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#12141D] text-white">
                    {c.name} — Bundles: [{c.bundleSizes.join(", ")}]
                  </option>
                ))}
              </select>
            </div>

            {/* Group Size Input */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FaUsers className="text-gray-500" />
                Group Size (1 – 10,000) *
              </label>
              <input
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                min="1"
                max="10000"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Preset Buttons & Cinema Info */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-500">Quick Test Sizes:</span>
              {presetSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={`px-2.5 py-1 rounded font-mono text-xs transition cursor-pointer ${
                    Number(groupSize) === size
                      ? "bg-red-600 text-white font-bold"
                      : "bg-white/5 hover:bg-white/10 text-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {selectedCinema && (
              <div className="font-mono text-gray-400 flex items-center gap-2">
                <span>Cinema Bundles:</span>
                <span className="text-amber-400 font-bold">
                  [{selectedCinema.bundleSizes.join(", ")}]
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={calculating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-red-900/30 transition disabled:opacity-50 cursor-pointer"
            >
              <FaCalculator />
              <span>{calculating ? "Calculating Quote..." : "Get Booking Quote"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Results Container */}
      {calculating ? (
        <Loader message="Querying GET /api/cinemas/:id/booking..." />
      ) : isAlgorithmPending ? (
        /* Graceful Algorithm Pending UI */
        <AlgorithmPendingCard
          title="Group Booking & Minimum Bundle Optimization"
          featureNumber="2"
          description="The frontend successfully queried GET /api/cinemas/:id/booking?groupSize=X. As specified in the assessment requirements, the dynamic programming / minimum bundle combination algorithm is reserved for you to write in Express."
          reservedFile="backend/src/controllers/cinemaController.js -> getBookingQuote"
          contextData={pendingContext}
          expectedFormat={`// If exact combination exists:
{
  "success": true,
  "possible": true,
  "cinema": "${selectedCinema?.name || "Cinema"}",
  "groupSize": ${groupSize},
  "totalBundles": 4,
  "totalSeats": 44,
  "breakdown": [
    { "size": 20, "count": 1 },
    { "size": 9, "count": 2 },
    { "size": 6, "count": 1 }
  ]
}

// If no combination adds up exactly:
{
  "success": true,
  "possible": false,
  "message": "Not possible"
}`}
          onRetry={handleGetQuote}
        />
      ) : quoteResult ? (
        /* Display calculated result */
        <div className="space-y-6">
          {quoteResult.possible === false || quoteResult.message === "Not possible" ? (
            /* Booking Not Possible State */
            <div className="rounded-xl border border-red-800/40 bg-gradient-to-b from-red-950/40 via-black/40 to-black p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-3">
                <FaTimesCircle className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Booking Not Possible
              </h3>
              <p className="mt-2 text-sm text-gray-300 max-w-lg mx-auto">
                No combination of available seat bundles ([
                {selectedCinema?.bundleSizes.join(", ")}]) can seat exactly{" "}
                <span className="text-red-400 font-bold">{groupSize}</span> people without empty seats.
              </p>
            </div>
          ) : (
            /* Booking Successful State */
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-black/40 to-black p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-emerald-500/20">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FaCheckCircle className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Exact Booking Combination Found!
                  </h3>
                  <p className="text-xs font-mono text-emerald-400">
                    Zero wasted seats • Group size: {quoteResult.groupSize || groupSize}
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-black/50 border border-white/5 p-4">
                  <span className="text-xs font-mono uppercase text-gray-400">
                    Total Bundles To Buy
                  </span>
                  <div className="mt-1 text-2xl font-extrabold text-white">
                    {quoteResult.totalBundles ||
                      (quoteResult.breakdown?.reduce((a, b) => a + (b.count || 0), 0) || 0)}
                  </div>
                </div>

                <div className="rounded-lg bg-black/50 border border-white/5 p-4">
                  <span className="text-xs font-mono uppercase text-gray-400">
                    Total Seats Booked
                  </span>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-400">
                    {quoteResult.totalSeats || groupSize} seats
                  </div>
                </div>

                <div className="rounded-lg bg-black/50 border border-white/5 p-4 col-span-2 sm:col-span-1">
                  <span className="text-xs font-mono uppercase text-gray-400">
                    Venue
                  </span>
                  <div className="mt-1 text-base font-bold text-white truncate">
                    {quoteResult.cinema || selectedCinema?.name}
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="mt-5">
                <h4 className="text-xs font-mono uppercase text-gray-400 mb-3 flex items-center gap-2">
                  <FaBoxOpen className="text-emerald-400" />
                  <span>Bundle Breakdown:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(
                    quoteResult.breakdown ||
                    (quoteResult.bundles
                      ? Object.entries(
                          quoteResult.bundles.reduce((acc, size) => {
                            acc[size] = (acc[size] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([size, count]) => ({ size: Number(size), count }))
                      : [])
                  ).map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between"
                    >
                      <span className="text-sm font-bold text-white">
                        {b.size} seats bundle
                      </span>
                      <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-bold">
                        × {b.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#12141D] p-10 text-center text-gray-400 text-sm">
          Select a cinema and group size above, then click "Get Booking Quote".
        </div>
      )}
    </div>
  );
};

export default BookingPage;
