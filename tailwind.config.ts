import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Default light theme colors
        primary: {
          DEFAULT: 'hsl(221.2 83.2% 53.3%)',
          foreground: 'hsl(210 40% 98%)',
        },
        // Custom themes
        theme: {
          blue: {
            primary: 'hsl(221.2 83.2% 53.3%)',
            'primary-foreground': 'hsl(210 40% 98%)',
          },
          green: {
            primary: 'hsl(160.1 84.1% 39.2%)',
            'primary-foreground': 'hsl(144.9 80.4% 10%)',
          },
          purple: {
            primary: 'hsl(262.1 83.3% 57.8%)',
            'primary-foreground': 'hsl(263.4 40% 96.9%)',
          },
        },
      },
    },
  },
  plugins: [
    // Add custom theme variants
    function({ addVariant, addBase, theme }: { 
      addVariant: (name: string, selector: string) => void;
      addBase: (styles: Record<string, any>) => void;
      theme: (path: string) => any;
    }) {
      // Add theme variants
      const themes = ['blue', 'green', 'purple'] as const;
      
      themes.forEach(themeName => {
        addVariant(`theme-${themeName}`, `:root:has(.theme-${themeName}) &`);
      });

      // Add theme-specific styles
      const themeColors = theme('colors.theme') as Record<string, {
        primary: string;
        'primary-foreground': string;
      }>;
      
      const styles: Record<string, Record<string, string>> = {};
      
      Object.entries(themeColors).forEach(([themeName, colors]) => {
        styles[`.theme-${themeName}`] = {
          '--primary': colors.primary,
          '--primary-foreground': colors['primary-foreground'],
        };
      });

      addBase(styles);
    },
  ],
};

export default config;
