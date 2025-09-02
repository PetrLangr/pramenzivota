import { prisma } from '@/lib/prisma';

async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        appointments: {
          include: {
            service: true,
            payment: true
          }
        }
      },
      orderBy: {
        totalSpent: 'desc'
      }
    });

    return customers.map(customer => ({
      ...customer,
      totalSpent: Number(customer.totalSpent),
      lastAppointment: customer.appointments[0]?.startDateTime || null,
      recentService: customer.appointments[0]?.service?.name || null
    }));
  } catch (error) {
    console.error('Chyba při načítání zákazníků:', error);
    return [];
  }
}

export default async function CustomersAdminPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa zákazníků</h1>
            <p className="text-gray-600">
              Přehled {customers.length} zákazníků a jejich historie rezervací
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export CSV
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Přidat zákazníka
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-users text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Zatím žádní zákazníci</h3>
            <p className="text-gray-500 mb-4">
              Zákazníci se automaticky vytvoří při první rezervaci.
            </p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Přidat zákazníka ručně
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezervace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utraceno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poslední návštěva
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Akce</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.recentService && (
                            <div className="text-xs text-gray-500">
                              Poslední: {customer.recentService}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.totalAppointments}
                      </div>
                      <div className="text-xs text-gray-500">
                        rezervací celkem
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.totalSpent.toLocaleString('cs-CZ')} Kč
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.lastAppointment 
                          ? new Date(customer.lastAppointment).toLocaleDateString('cs-CZ')
                          : 'Nikdy'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <i className="fas fa-eye" title="Zobrazit detail"></i>
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <i className="fas fa-calendar-plus" title="Nová rezervace"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}