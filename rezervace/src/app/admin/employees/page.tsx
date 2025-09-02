import EmployeesManager from '@/components/admin/EmployeesManager';

export default function EmployeesAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa zaměstnanců</h1>
            <p className="text-gray-600">
              Spravujte zaměstnance, jejich pracovní dobu a přiřazené služby
            </p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Přidat zaměstnance
          </button>
        </div>
      </div>

      {/* Employees Manager */}
      <EmployeesManager />
    </div>
  );
}