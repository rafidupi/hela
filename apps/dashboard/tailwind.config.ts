import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta hela — verde lima sobre superficies casi negras, en línea con la landing.
        brand: {
          50: '#f6ffd9',
          100: '#ecffb3',
          200: '#dcff80',
          300: '#caff4d',
          400: '#bbff1a',
          500: '#b7ff00', // accent canónico hela.
          600: '#a3e600',
          700: '#82b800',
          800: '#618a00',
          900: '#3d5700',
        },
        surface: {
          DEFAULT: '#0a0c10',
          elevated: '#101319',
          muted: '#161a22',
        },
        severity: {
          info: '#38bdf8',
          low: '#a3e635',
          medium: '#facc15',
          high: '#fb923c',
          critical: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
