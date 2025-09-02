import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administrace | Pramen života s.r.o.',
  description: 'Administrační rozhraní rezervačního systému',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <a href="/" className="flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/pramen_zivota_logo_header.png"
                    alt="Pramen života s.r.o."
                  />
                  <span className="ml-3 text-xl font-semibold text-gray-900">
                    Administrace
                  </span>
                </a>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/admin" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-chart-line mr-2"></i>Dashboard
                </a>
                <a href="/admin/services" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-heart mr-2"></i>Služby
                </a>
                <a href="/admin/employees" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-users mr-2"></i>Zaměstnanci
                </a>
                <a href="/admin/appointments" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-calendar mr-2"></i>Rezervace
                </a>
                <a href="/admin/customers" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-user-friends mr-2"></i>Zákazníci
                </a>
                <a href="/admin/settings" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-cog mr-2"></i>Nastavení
                </a>
              </div>
            </div>
            
            {/* Right side */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <a href="file:///Users/petrlangr/Downloads/pramen_zivota/website/index.html" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                <i className="fas fa-external-link-alt mr-1"></i>Zpět na web
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}