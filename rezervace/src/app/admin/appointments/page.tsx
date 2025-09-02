import AppointmentsCalendar from '@/components/admin/AppointmentsCalendar';

export default function AppointmentsAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa rezervací</h1>
            <p className="text-gray-600">
              Kalendářový přehled a správa všech rezervací
            </p>
          </div>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm">
              <option value="all">Všichni zaměstnanci</option>
              <option value="1">MUDr. Petra Svoboda</option>
              <option value="2">Mgr. Marie Krásná</option>
            </select>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Nová rezervace
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <AppointmentsCalendar />
    </div>
  );
}