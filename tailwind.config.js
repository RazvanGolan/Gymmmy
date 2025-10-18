/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary brand color (cyan-blue-green)
        primary: '#10d6bf',

        // Light theme
        'light-background': '#ffffff',
        'light-surface': '#f8fafc',
        'light-surface-secondary': '#e2e8f0',
        'light-text': '#1e293b',
        'light-text-secondary': '#475569',
        'light-text-muted': '#64748b',
        'light-border': '#e2e8f0',
        'light-border-secondary': '#cbd5e1',

        // Dark theme
        'dark-background': '#111827',
        'dark-surface': '#1f2937',
        'dark-surface-secondary': '#374151',
        'dark-text': '#f3f4f6',
        'dark-text-secondary': '#d1d5db',
        'dark-text-muted': '#9ca3af',
        'dark-border': '#374151',
        'dark-border-secondary': '#4b5563',

        // Status
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
}