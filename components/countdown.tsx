"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { useVault } from '@/hooks/use-vault';

export function Countdown() {
  const { isActive } = useVault();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      if (!isActive) {
        // If vault is inactive, calculate time until Monday 10:00
        const monday = new Date();
        monday.setDate(monday.getDate() + (1 - monday.getDay() + 7) % 7);
        monday.setHours(10, 0, 0, 0);
        const difference = monday.getTime() - now.getTime();

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        // If vault is active, calculate time until Sunday midnight
        const sunday = new Date();
        sunday.setDate(sunday.getDate() + (7 - sunday.getDay()) % 7);
        sunday.setHours(0, 0, 0, 0);
        const difference = sunday.getTime() - now.getTime();

        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white flex items-center mb-4">
        <Timer className="mr-2 h-5 w-5" />
        {isActive ? 'Time Until Draw' : 'Next Lottery Starts In'}
      </h2>
      {!isActive ? (
        <div className="bg-black/40 rounded-lg p-6 text-center">
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <motion.div
                key={unit}
                className="bg-black/40 rounded-lg p-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-3xl font-bold text-yellow-400">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-sm text-yellow-200 capitalize">{unit}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-yellow-400 mt-4">
            New lottery starts Monday at 10:00
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <motion.div
              key={unit}
              className="bg-black/40 rounded-lg p-4 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold text-white">
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-sm text-blue-200 capitalize">{unit}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}