'use client';

import { useState } from 'react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  servicesCount: number;
  totalAppointments: number;
  workingHours: WorkingHour[];
}

interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'Petra',
    lastName: 'Svoboda',
    email: 'petra.svoboda@pramenzivota.cz',
    phone: '+420 123 456 789',
    isActive: true,
    servicesCount: 3,
    totalAppointments: 24,
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }
    ]
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Krásná',
    email: 'marie.krasna@pramenzivota.cz',
    phone: '+420 987 654 321',
    isActive: true,
    servicesCount: 2,
    totalAppointments: 18,
    workingHours: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }
    ]
  }
];

export default function EmployeesManager() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'schedule'>('list');

  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

  const getWorkingHoursForEmployee = (employee: Employee) => {
    const schedule = Array(7).fill(null);
    employee.workingHours.forEach(wh => {
      schedule[wh.dayOfWeek] = `${wh.startTime} - ${wh.endTime}`;
    });
    return schedule;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-users mr-2"></i>
            Seznam zaměstnanců
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-calendar mr-2"></i>
            Pracovní rozpisy
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'list' ? (
          <div className="space-y-6">
            {mockEmployees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    {employee.avatar ? (
                      <img 
                        src={employee.avatar} 
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-medium text-lg">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        <i className="fas fa-envelope mr-1"></i>
                        {employee.email}
                      </span>
                      {employee.phone && (
                        <span>
                          <i className="fas fa-phone mr-1"></i>
                          {employee.phone}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        <i className="fas fa-heart mr-1"></i>
                        {employee.servicesCount} {employee.servicesCount === 1 ? 'služba' : 'služeb'}
                      </span>
                      <span>
                        <i className="fas fa-calendar-check mr-1"></i>
                        {employee.totalAppointments} rezervací tento měsíc
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button 
                      className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                      onClick={() => setSelectedEmployee(employee.id)}
                    >
                      <i className="fas fa-calendar mr-1"></i>
                      Rozvrh
                    </button>
                    <button className="bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                      <i className="fas fa-edit mr-1"></i>
                      Upravit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Schedule View */}
            <div className="space-y-6">
              {mockEmployees.map((employee) => {
                const schedule = getWorkingHoursForEmployee(employee);
                
                return (
                  <div key={employee.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <button className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm">
                        <i className="fas fa-edit mr-1"></i>
                        Upravit rozvrh
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {dayNames.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs font-medium text-gray-500 mb-2">
                            {day}
                          </div>
                          <div className={`p-2 rounded text-xs ${
                            schedule[index] 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-gray-50 text-gray-400 border border-gray-200'
                          }`}>
                            {schedule[index] || 'Volno'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}