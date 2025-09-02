import DashboardStats from '@/components/admin/DashboardStats';
import RecentAppointments from '@/components/admin/RecentAppointments';
import PerformanceCharts from '@/components/admin/PerformanceCharts';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Přehled rezervačního systému - Pramen života s.r.o.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Nová rezervace
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <RecentAppointments />
        
        {/* Performance Charts */}
        <PerformanceCharts />
      </div>
    </div>
  );
}