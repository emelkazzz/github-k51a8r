"use client";

import { Users, TrendingUp, Timer } from 'lucide-react';
import { useVault } from '@/hooks/use-vault';

export function AdminStats() {
  const { prizeAmount, totalParticipants } = useVault();

  const getNextDrawTime = () => {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    return nextSunday.toLocaleString();
  };

  const stats = [
    {
      label: 'Total Prize Pool',
      value: `€${prizeAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Total Participants',
      value: totalParticipants,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Next Draw',
      value: getNextDrawTime(),
      icon: Timer,
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </>
  );
}