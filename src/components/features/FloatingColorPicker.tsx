'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, X, Minimize2, Maximize2, Plus, Minus, Type } from 'lucide-react';

interface FloatingColorPickerProps {
  onColorChange?: (color: string) => void;
}

export function FloatingColorPicker({ onColorChange }: FloatingColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16); // Default font size in pixels

  const presetColors = [
    '#ffffff', // White
    '#f8fafc', // Very light gray
    '#f1f5f9', // Light gray
    '#e2e8f0', // Light steel gray
    '#fef3c7', // Light yellow
    '#fef9c3', // Lighter yellow
    '#dbeafe', // Light blue
    '#e0f2fe', // Lighter blue
    '#e0e7ff', // Light indigo
    '#e9d5ff', // Light purple
    '#fce7f3', // Light pink
    '#ffe4e6', // Lighter pink
    '#dcfce7', // Light green
    '#d1fae5', // Lighter green
    '#fed7aa', // Light orange
    '#fecaca', // Light red
    '#f3e8ff', // Light lavender
    '#ecfdf5', // Light mint
    '#fee2e2', // Very light red
    '#fef2f2', // Lighter red
    '#ffedd5', // Light peach
    '#fff7ed', // Lighter peach
    '#f0fdf4', // Light green
    '#bbf7d0', // Mint green
    '#d9f99d', // Lime green
    '#fef08a', // Light yellow-green
    '#fde047', // Bright yellow
    '#facc15', // Golden yellow
    '#fbbf24', // Amber
    '#fb923c', // Orange
    '#f87171', // Light red
    '#ef4444', // Medium red
    '#dc2626', // Red
  ];

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('background-color');
    if (savedColor) {
      setBackgroundColor(savedColor);
      setCustomColor(savedColor);
      applyBackgroundColor(savedColor);
    }
    
    // Load saved font size from localStorage
    const savedFontSize = localStorage.getItem('font-size');
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      applyFontSize(size);
    }
  }, []);

  const applyBackgroundColor = (color: string) => {
    document.body.style.backgroundColor = color;
    document.body.style.transition = 'background-color 0.3s ease';
  };

  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}px`;
    document.documentElement.style.transition = 'font-size 0.3s ease';
  };

  const handleColorChange = (color: string) => {
    setBackgroundColor(color);
    setCustomColor(color);
    applyBackgroundColor(color);
    localStorage.setItem('background-color', color);
    onColorChange?.(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    handleColorChange(color);
  };

  const resetToDefault = () => {
    handleColorChange('#ffffff');
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 32); // Max 32px
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12); // Min 12px
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('font-size', newSize.toString());
  };

  const resetFontSize = () => {
    const defaultSize = 16;
    setFontSize(defaultSize);
    applyFontSize(defaultSize);
    localStorage.setItem('font-size', defaultSize.toString());
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Palette className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <Card className="w-80 shadow-2xl border-2 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Background Color
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Current Color Display */}
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner"
                style={{ backgroundColor }}
              />
              <div>
                <Label className="text-sm font-medium">Current Color</Label>
                <p className="text-xs text-muted-foreground font-mono">{backgroundColor}</p>
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Colors</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                      backgroundColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <Label htmlFor="custom-color" className="text-sm font-medium mb-2 block">
                Custom Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-color"
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                      handleCustomColorChange(e);
                    } else {
                      setCustomColor(value);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            {/* Font Size Control */}
            <div>
              <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 12}
                  className="px-2"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium">{fontSize}px</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 32}
                  className="px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFontSize}
                className="w-full mt-2 text-xs"
              >
                Reset Font Size
              </Button>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetToDefault}
              className="w-full"
            >
              Reset to Default
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
