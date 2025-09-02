'use client';

import { useState, useEffect } from 'react';

interface DashboardStatsData {
  totalAppointments: number;
  totalRevenue: number;
  utilizationRate: number;
  newCustomers: number;
  appointmentsChange: number;
  revenueChange: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalAppointments: 47,
    totalRevenue: 68400,
    utilizationRate: 73,
    newCustomers: 12,
    appointmentsChange: 8.2,
    revenueChange: 12.5
  });

  const [period, setPeriod] = useState('thisMonth');

  const statCards = [
    {
      title: 'Celkem rezervací',
      value: stats.totalAppointments,
      change: stats.appointmentsChange,
      icon: 'fa-calendar-check',
      color: 'blue'
    },
    {
      title: 'Tržby',
      value: `${stats.totalRevenue.toLocaleString('cs-CZ')} Kč`,
      change: stats.revenueChange,
      icon: 'fa-chart-line',
      color: 'green'
    },
    {
      title: 'Vytíženost',
      value: `${stats.utilizationRate}%`,
      change: 5.1,
      icon: 'fa-percentage',
      color: 'purple'
    },
    {
      title: 'Noví zákazníci',
      value: stats.newCustomers,
      change: 15.3,
      icon: 'fa-users',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50', 
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Period Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Souhrnné statistiky</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="today">Dnes</option>
          <option value="thisWeek">Tento týden</option>
          <option value="thisMonth">Tento měsíc</option>
          <option value="last30Days">Posledních 30 dní</option>
          <option value="custom">Vlastní období</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const [iconColor, textColor, bgColor] = getColorClasses(stat.color).split(' ');
          
          return (
            <div key={index} className="relative overflow-hidden rounded-lg bg-white p-6 shadow border border-gray-200">
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${bgColor}`}>
                  <i className={`fas ${stat.icon} h-6 w-6 ${textColor}`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              
              {/* Change indicator */}
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.change >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <i className={`fas ${stat.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="ml-2 text-gray-500">
                    oproti předchozímu období
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}