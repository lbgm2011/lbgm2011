import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains('dark');
    setIsDark(current);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);

    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // Prevent hydration flash — render nothing until mounted
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group relative flex items-center gap-2 p-2 rounded-sm cursor-pointer
                 text-[var(--text-faint)] hover:text-[var(--text-primary)]
                 transition-colors duration-300"
    >
      {/* Icon with rotation animation */}
      <span
        className="block transition-transform duration-500 ease-out"
        style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </span>

      {/* Label — visible on hover only */}
      <span
        className="font-mono text-[10px] tracking-[0.2em] uppercase
                   opacity-0 group-hover:opacity-100
                   translate-x-[-4px] group-hover:translate-x-0
                   transition-all duration-300 pointer-events-none
                   hidden md:inline"
      >
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
