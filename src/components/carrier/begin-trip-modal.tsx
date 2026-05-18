"use client";

import { useState } from "react";
import { X, Camera } from "lucide-react";
import { uploadTripPhoto, updateTripStatus } from "@/app/actions/carrier";

export interface BeginTripModalProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BeginTripModal({
  tripId,
  isOpen,
  onClose,
  onSuccess,
}: BeginTripModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a photo");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create a FormData container to safely stream the file
      const formData = new FormData();
      formData.append("file", file);

      // 2. Pass formData instead of the raw file
      await uploadTripPhoto(tripId, "start", formData);

      // 3. Update trip status to on_trip
      await updateTripStatus(tripId, "on_trip");

      // Reset and close
      setFile(null);
      setPreview(null);
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to begin trip");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Begin Trip</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Start Photo <span className="text-red-500">*(less than 1mb)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={isLoading}
                className="sr-only"
                id="start-photo"
              />
              <label
                htmlFor="start-photo"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Camera size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-900">
                      Take a Photo
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      or tap to browse
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Starting..." : "Start Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
