'use client';

interface Appointment {
  id: string;
  customerName: string;
  serviceName: string;
  employeeName: string;
  startTime: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELED' | 'COMPLETED';
  price: number;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    customerName: 'Anna Nováková',
    serviceName: 'Energetické vyšetření',
    employeeName: 'MUDr. Petra Svoboda',
    startTime: '2024-08-30T09:00:00',
    status: 'APPROVED',
    price: 1200
  },
  {
    id: '2', 
    customerName: 'Josef Novák',
    serviceName: 'Reiki léčení',
    employeeName: 'Mgr. Marie Krásná',
    startTime: '2024-08-30T14:00:00',
    status: 'PENDING',
    price: 1100
  },
  {
    id: '3',
    customerName: 'Eva Černá',
    serviceName: 'Chakrová terapie',
    employeeName: 'MUDr. Petra Svoboda',
    startTime: '2024-08-31T10:30:00',
    status: 'APPROVED',
    price: 1500
  }
];

export default function RecentAppointments() {
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800', 
      COMPLETED: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      PENDING: 'Čeká',
      APPROVED: 'Schválená',
      CANCELED: 'Zrušená',
      COMPLETED: 'Dokončená'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('cs-CZ'),
      time: date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Nadcházející rezervace</h2>
        <a 
          href="/admin/appointments" 
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          Zobrazit vše
        </a>
      </div>

      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {mockAppointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.startTime);
            
            return (
              <li key={appointment.id} className="py-5">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <i className="fas fa-calendar text-indigo-600"></i>
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.customerName}
                      </p>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          <i className="fas fa-heart mr-1"></i>
                          {appointment.serviceName}
                        </span>
                        <span>
                          <i className="fas fa-user-md mr-1"></i>
                          {appointment.employeeName}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.price.toLocaleString('cs-CZ')} Kč
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{date} v {time}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
                      <i className="fas fa-edit mr-1"></i>
                      Upravit
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <button className="flex-1 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
            <i className="fas fa-plus mr-2"></i>
            Přidat rezervaci
          </button>
          <button className="flex-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
            <i className="fas fa-calendar mr-2"></i>
            Kalendář
          </button>
        </div>
      </div>
    </div>
  );
}