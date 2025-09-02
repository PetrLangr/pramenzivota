'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalAppointments: number;
  totalSpent: number;
  lastAppointment?: string;
  status: 'active' | 'inactive';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'Anna',
    lastName: 'Nováková',
    email: 'anna.novakova@email.cz',
    phone: '+420 111 222 333',
    totalAppointments: 8,
    totalSpent: 12400,
    lastAppointment: '2024-08-25T14:00:00',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Josef',
    lastName: 'Novák', 
    email: 'josef.novak@email.cz',
    phone: '+420 444 555 666',
    totalAppointments: 3,
    totalSpent: 4200,
    lastAppointment: '2024-08-20T10:00:00',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Eva',
    lastName: 'Černá',
    email: 'eva.cerna@email.cz',
    totalAppointments: 12,
    totalSpent: 18600,
    lastAppointment: '2024-08-28T16:00:00',
    status: 'active'
  },
  {
    id: '4',
    firstName: 'Tomáš',
    lastName: 'Dvořák',
    email: 'tomas.dvorak@email.cz',
    phone: '+420 777 888 999',
    totalAppointments: 1,
    totalSpent: 1200,
    lastAppointment: '2024-07-15T11:00:00',
    status: 'inactive'
  }
];

export default function CustomersManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'totalAppointments' | 'lastAppointment'>('name');

  const filteredCustomers = mockCustomers
    .filter(customer => {
      const matchesSearch = 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'totalAppointments':
          return b.totalAppointments - a.totalAppointments;
        case 'lastAppointment':
          return new Date(b.lastAppointment || 0).getTime() - new Date(a.lastAppointment || 0).getTime();
        default:
          return 0;
      }
    });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nikdy';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {status === 'active' ? 'Aktivní' : 'Neaktivní'}
    </span>
  );

  const getCustomerLevel = (totalSpent: number) => {
    if (totalSpent >= 15000) return { level: 'VIP', color: 'text-purple-600 bg-purple-100' };
    if (totalSpent >= 8000) return { level: 'Premium', color: 'text-blue-600 bg-blue-100' };
    if (totalSpent >= 3000) return { level: 'Stálý', color: 'text-green-600 bg-green-100' };
    return { level: 'Nový', color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Hledat zákazníky..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Všichni zákazníci</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="name">Řadit podle jména</option>
              <option value="totalSpent">Podle utracených peněz</option>
              <option value="totalAppointments">Podle počtu rezervací</option>
              <option value="lastAppointment">Podle poslední návštěvy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Akce</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => {
              const level = getCustomerLevel(customer.totalSpent);
              
              return (
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
                        <div className="text-xs">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                            {level.level}
                          </span>
                        </div>
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
                      {formatDate(customer.lastAppointment)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <i className="fas fa-eye" title="Zobrazit detail"></i>
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <i className="fas fa-calendar-plus" title="Nová rezervace"></i>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <i className="fas fa-edit" title="Upravit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</div>
            <div className="text-sm text-gray-500">Celkem zákazníků</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredCustomers.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Aktivních</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {filteredCustomers.reduce((sum, c) => sum + c.totalAppointments, 0)}
            </div>
            <div className="text-sm text-gray-500">Celkem rezervací</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('cs-CZ')} Kč
            </div>
            <div className="text-sm text-gray-500">Celkové tržby</div>
          </div>
        </div>
      </div>
    </div>
  );
}