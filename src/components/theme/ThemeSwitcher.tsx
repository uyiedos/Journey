'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const themeOptions = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Laptop },
] as const;

const colorThemes = [
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'green', name: 'Green', color: 'bg-emerald-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
] as const;

export function ThemeSwitcher() {
  const { theme, resolvedTheme, themePreference, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-border/50"
          >
            <Palette className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-2 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl"
        >
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Theme
          </div>
          {themeOptions.map(({ id, name, icon: Icon }) => (
            <DropdownMenuItem
              key={id}
              onClick={() => {
                setTheme(id);
                setIsOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </div>
              {theme === id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="my-2" />
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Accent Color
          </div>
          <div className="grid grid-cols-3 gap-2 p-2">
            {colorThemes.map(({ id, color }) => (
              <button
                key={id}
                onClick={() => {
                  setTheme(id);
                  setIsOpen(false);
                }}
                className={cn(
                  'h-8 w-full rounded-md flex items-center justify-center',
                  color,
                  'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  themePreference === id && 'ring-2 ring-offset-2 ring-primary'
                )}
                aria-label={`${id} theme`}
              >
                {themePreference === id && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
