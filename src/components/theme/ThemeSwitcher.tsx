'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const themeOptions = [
  { id: 'light', name: 'Light', color: 'bg-gray-100' },
  { id: 'dark', name: 'Dark', color: 'bg-gray-800' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'green', name: 'Green', color: 'bg-emerald-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-6 bottom-20 md:bottom-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 mb-2 w-48">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="sm"
                className={cn(
                  'justify-start gap-2 h-auto p-2',
                  theme === option.id ? 'border-primary' : ''
                )}
                onClick={() => {
                  setTheme(option.id);
                  setIsOpen(false);
                }}
              >
                <div className={cn('w-4 h-4 rounded-full', option.color)} />
                <span>{option.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-12 w-12 shadow-lg"
        variant="secondary"
        size="icon"
      >
        <Palette className="h-5 w-5" />
      </Button>
    </div>
  );
}
