"use client";

import { X, Clock, MapPin, Thermometer, Package } from "lucide-react";
import type { CarrierTrip, TripPhotoRow } from "@/app/actions/carrier";

export interface POCModalProps {
  trip: CarrierTrip;
  photos: TripPhotoRow | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateDuration(
  startedAt: string | null,
  completedAt: string | null,
): string {
  if (!startedAt || !completedAt) return "—";

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function POCModal({ trip, photos, isOpen, onClose }: POCModalProps) {
  if (!isOpen) return null;

  const duration = calculateDuration(trip.started_at, trip.completed_at);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Trip Summary</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Duration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Duration
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{duration}</p>
            <p className="text-xs text-blue-700 mt-1">
              {formatDate(trip.started_at)} • {formatTime(trip.started_at)} to{" "}
              {formatTime(trip.completed_at)}
            </p>
          </div>

          {/* Origin */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-slate-600" />
              <label className="block text-sm font-medium text-slate-900">
                Origin
              </label>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-1">
              {trip.origin_name_snapshot && (
                <p className="font-medium text-slate-900">
                  {trip.origin_name_snapshot}
                </p>
              )}
              <p className="text-sm text-slate-600">
                {trip.origin_address_snapshot || "—"}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-slate-600" />
              <label className="block text-sm font-medium text-slate-900">
                Destination
              </label>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-1">
              {trip.dest_name_snapshot && (
                <p className="font-medium text-slate-900">
                  {trip.dest_name_snapshot}
                </p>
              )}
              <p className="text-sm text-slate-600">
                {trip.destination_address_snapshot || "—"}
              </p>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer size={18} className="text-slate-600" />
                <label className="block text-sm font-medium text-slate-900">
                  Target Temp
                </label>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {trip.target_temp}°C
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} className="text-slate-600" />
                <label className="block text-sm font-medium text-slate-900">
                  Goods
                </label>
              </div>
              <p className="text-sm text-slate-600">{trip.type_of_goods}</p>
            </div>
          </div>

          {/* Photos Section */}
          {photos && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Trip Photos</h3>

              {/* Start Photo */}
              {photos.start_photo_url && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Start Photo</p>
                  <img
                    src={photos.start_photo_url}
                    alt="Trip start"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  {photos.start_captured_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(photos.start_captured_at)}
                    </p>
                  )}
                </div>
              )}

              {/* End Photo */}
              {photos.end_photo_url && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">End Photo</p>
                  <img
                    src={photos.end_photo_url}
                    alt="Trip end"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  {photos.end_captured_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(photos.end_captured_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
