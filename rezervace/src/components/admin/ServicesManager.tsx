'use client';

import { useState } from 'react';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  serviceCount: number;
}

interface Service {
  id: string;
  name: string;
  categoryName: string;
  duration: number;
  price: number;
  maxCapacity: number;
  isActive: boolean;
}

const mockCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Energetické terapie',
    description: 'Léčení a harmonizace energetických toků',
    color: '#3B82F6',
    serviceCount: 3
  },
  {
    id: '2', 
    name: 'Holistické přístupy',
    description: 'Komplexní terapie pro tělo i mysl',
    color: '#10B981',
    serviceCount: 2
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Energetické vyšetření',
    categoryName: 'Energetické terapie',
    duration: 60,
    price: 1200,
    maxCapacity: 1,
    isActive: true
  },
  {
    id: '2',
    name: 'Chakrová terapie', 
    categoryName: 'Energetické terapie',
    duration: 90,
    price: 1500,
    maxCapacity: 1,
    isActive: true
  },
  {
    id: '3',
    name: 'Reiki léčení',
    categoryName: 'Holistické přístupy',
    duration: 60,
    price: 1100,
    maxCapacity: 1,
    isActive: true
  }
];

export default function ServicesManager() {
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Aktivní' : 'Neaktivní'}
    </span>
  );

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-heart mr-2"></i>
            Služby ({mockServices.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i className="fas fa-tags mr-2"></i>
            Kategorie ({mockCategories.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'services' ? (
          <div>
            {/* Services Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Služba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Délka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapacita
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
                  {mockServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {service.categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.price.toLocaleString('cs-CZ')} Kč
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.maxCapacity} {service.maxCapacity === 1 ? 'osoba' : 'osob'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(service.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCategories.map((category) => (
                <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.serviceCount} {category.serviceCount === 1 ? 'služba' : 'služeb'}
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                      Zobrazit služby
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add Category Card */}
              <div 
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus text-gray-400 text-2xl mb-2"></i>
                <span className="text-gray-600 font-medium">
                  Přidat kategorii
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}