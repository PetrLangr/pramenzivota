'use client';

export default function PerformanceCharts() {
  // Mock data pro grafy
  const weeklyData = [
    { day: 'Po', appointments: 8, revenue: 12500 },
    { day: 'Út', appointments: 12, revenue: 18000 },
    { day: 'St', appointments: 6, revenue: 9200 },
    { day: 'Čt', appointments: 15, revenue: 22800 },
    { day: 'Pá', appointments: 11, revenue: 16900 },
    { day: 'So', appointments: 4, revenue: 6000 },
    { day: 'Ne', apartments: 0, revenue: 0 }
  ];

  const topServices = [
    { name: 'Energetické vyšetření', count: 18, revenue: 21600, color: '#3B82F6' },
    { name: 'Chakrová terapie', count: 12, revenue: 18000, color: '#10B981' },
    { name: 'Reiki léčení', count: 10, revenue: 11000, color: '#8B5CF6' },
    { name: 'Křišťálová terapie', count: 7, revenue: 9100, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Performance */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Týdenní přehled
        </h3>
        
        <div className="space-y-4">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex items-center">
              <div className="w-8 text-sm font-medium text-gray-500">
                {day.day}
              </div>
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{day.appointments} rezervací</span>
                  <span className="text-sm font-medium text-gray-900">
                    {day.revenue.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(day.appointments / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nejpopulárnější služby
        </h3>
        
        <div className="space-y-4">
          {topServices.map((service, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: service.color }}
              ></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {service.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {service.count}× • {service.revenue.toLocaleString('cs-CZ')} Kč
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${(service.count / 18) * 100}%`,
                      backgroundColor: service.color 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            Zobrazit detailní analýzu
          </button>
        </div>
      </div>
    </div>
  );
}