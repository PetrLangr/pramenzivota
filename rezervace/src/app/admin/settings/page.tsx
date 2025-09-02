export default function SettingsAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nastavení systému</h1>
            <p className="text-gray-600">
              Konfigurujte platby, notifikace a obecná nastavení
            </p>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <i className="fas fa-save mr-2"></i>
            Uložit změny
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button className="py-4 px-1 border-b-2 border-indigo-500 text-indigo-600 font-medium text-sm">
              <i className="fas fa-cog mr-2"></i>
              Obecné
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              <i className="fas fa-credit-card mr-2"></i>
              Platby
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              <i className="fas fa-envelope mr-2"></i>
              E-maily
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
              <i className="fas fa-calendar mr-2"></i>
              Rezervace
            </button>
          </nav>
        </div>

        {/* General Settings */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název centra
              </label>
              <input
                type="text"
                defaultValue="Pramen života s.r.o."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kontaktní e-mail
              </label>
              <input
                type="email"
                defaultValue="info@pramenzivota.cz"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                defaultValue="+420 123 456 789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Časové pásmo
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                <option value="Europe/Prague">Europe/Prague (GMT+1)</option>
                <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresa centra
            </label>
            <textarea
              rows={3}
              defaultValue="Václavské náměstí 1, 110 00 Praha 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Approval Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Nastavení rezervací</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Automaticky schvalovat nové rezervace
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Povolit rezervace na víkendy
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Vyžadovat telefonní číslo při rezervaci
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimální doba předem (hodiny)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximální doba dopředu (dny)
                </label>
                <input
                  type="number"
                  defaultValue="90"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}