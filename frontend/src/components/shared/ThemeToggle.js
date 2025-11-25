import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'sm', variant }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const resolvedVariant = variant || (isDark ? 'light' : 'outline-secondary');

  return (
    <Button
      variant={resolvedVariant}
      size={size}
      onClick={toggleTheme}
      type="button"
      className={`theme-toggle-btn d-flex align-items-center gap-2 ${className}`}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
    >
      {isDark ? <FaSun /> : <FaMoon />}
      <span className="label d-none d-xl-inline">
        {isDark ? 'Aydınlık' : 'Karanlık'}
      </span>
    </Button>
  );
};

export default ThemeToggle;

