import ServicesManager from '@/components/admin/ServicesManager';

export default function ServicesAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa služeb</h1>
            <p className="text-gray-600">
              Spravujte služby, kategorie a cenník vašeho centra
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Přidat kategorii
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Přidat službu
            </button>
          </div>
        </div>
      </div>

      {/* Services Manager */}
      <ServicesManager />
    </div>
  );
}