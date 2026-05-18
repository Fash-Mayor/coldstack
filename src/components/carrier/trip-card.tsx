"use client";

import { Loader2 } from "lucide-react";
import type { CarrierTrip } from "@/app/actions/carrier";

export interface TripCardProps {
  trip: CarrierTrip;
  onStatusClick: () => void;
  isLoading?: boolean;
}

function getStatusColors(status: string) {
  switch (status) {
    case "assigned":
    case "pending":
      return {
        buttonBg: "bg-yellow-400 hover:bg-yellow-500",
        buttonText: "text-slate-900",
        label: "Pending",
      };
    case "en_route":
      return {
        buttonBg: "bg-blue-500 hover:bg-blue-600",
        buttonText: "text-white",
        label: "En Route",
      };
    case "on_trip":
      return {
        buttonBg: "bg-green-500 hover:bg-green-600",
        buttonText: "text-white",
        label: "Active",
      };
    case "completed":
      return {
        buttonBg: "bg-slate-400 hover:bg-slate-500",
        buttonText: "text-white",
        label: "POC",
      };
    default:
      return {
        buttonBg: "bg-slate-300 hover:bg-slate-400",
        buttonText: "text-slate-900",
        label: "—",
      };
  }
}

export function TripCard({
  trip,
  onStatusClick,
  isLoading = false,
}: TripCardProps) {
  const colors = getStatusColors(trip.status);

  const handleClick = () => {
    onStatusClick();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        {/* Left: Trip Info */}
        <div className="sm:col-span-2 p-4 sm:p-6 space-y-4">
          {/* Origin */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Origin
            </p>
            {trip.origin_name_snapshot && (
              <p className="font-semibold text-slate-900">
                {trip.origin_name_snapshot}
              </p>
            )}
            <p className="text-sm text-slate-600 line-clamp-2">
              {trip.origin_address_snapshot}
            </p>
          </div>

          {/* Destination */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Destination
            </p>
            {trip.dest_name_snapshot && (
              <p className="font-semibold text-slate-900">
                {trip.dest_name_snapshot}
              </p>
            )}
            <p className="text-sm text-slate-600 line-clamp-2">
              {trip.destination_address_snapshot}
            </p>
          </div>

          {/* Cargo Details */}
          <div className="flex gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Target Temp
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {trip.target_temp}°C
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Goods
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {trip.type_of_goods}
              </p>
            </div>
          </div>
        </div>

        {/* Right: State Button */}
        <div className="bg-slate-50 sm:bg-white flex sm:flex-col items-center justify-center p-4 sm:p-6 border-t sm:border-t-0 sm:border-l border-slate-200">
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-3 sm:py-4 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center whitespace-nowrap flex items-center justify-center gap-2 ${colors.buttonBg} ${colors.buttonText}`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {colors.label}
          </button>
        </div>
      </div>
    </div>
  );
}
