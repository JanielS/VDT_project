import { Moon, Sun } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export function ThemeToggle() {
  const themeMode = useSimulationStore((state) => state.themeMode);
  const setThemeMode = useSimulationStore((state) => state.setThemeMode);
  const isDark = themeMode === 'dark';

  return (
    <button
      className="icon-button"
      title={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
      onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
      type="button"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
