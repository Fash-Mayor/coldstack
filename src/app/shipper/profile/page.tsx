export default function ShipperProfilePage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm max-w-md w-full mx-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-white">👤</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600 mb-2">
          Manage your shipper profile and preferences.
        </p>
        <div className="inline-block bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg px-4 py-2 mt-6">
          <p className="text-sm font-semibold text-blue-700">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
