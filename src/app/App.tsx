import '@xyflow/react/dist/style.css';
import { useEffect } from 'react';
import { VdtCanvas } from '../components/Canvas/VdtCanvas';
import { FormulaDetails } from '../components/FormulaDetails/FormulaDetails';
import { SidePanel } from '../components/SidePanel/SidePanel';
import { UserTour } from '../components/UserTour/UserTour';
import { useSimulationStore } from '../store/simulationStore';
import { applyThemeTokens, darkTheme, lightTheme } from '../themes/theme';
import { formatNumber } from '../utils/formatNumber';
import './styles.css';

export function App() {
  const themeMode = useSimulationStore((state) => state.themeMode);
  const ebitda = useSimulationStore((state) => state.indicators.find((indicator) => indicator.id === 'ebitda'));
  const ebitdaActual = ebitda?.values.actual ?? 0;
  const ebitdaWhatIf = ebitda?.values.whatIf ?? ebitdaActual;
  const ebitdaDelta = ebitdaWhatIf - ebitdaActual;
  const ebitdaDeltaPct = ebitdaActual === 0 ? 0 : ebitdaDelta / Math.abs(ebitdaActual);
  const logoSrc = themeMode === 'dark' ? '/MVV_LOGO_BRANCA.png' : '/Logo_MVV.png';

  useEffect(() => {
    applyThemeTokens(themeMode === 'dark' ? darkTheme : lightTheme);
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src={logoSrc} alt="Mineracao Vale Verde" />
          <div>
            <strong>VDT</strong>
            <span>Value Driver Tree</span>
          </div>
        </div>
        <div className="header-kpis" data-tour="ebitda-kpi">
          <span>EBITDA What If</span>
          <strong>{formatNumber(ebitdaWhatIf, 'kUSD')}</strong>
          <small className={ebitdaDelta >= 0 ? 'positive' : 'negative'}>
            {ebitdaDelta >= 0 ? '+' : ''}
            {formatNumber(ebitdaDelta, 'kUSD')} vs Actual (
            {new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
              style: 'percent',
            }).format(ebitdaDeltaPct)}
            )
          </small>
        </div>
      </header>
      <div className="workspace">
        <SidePanel />
        <VdtCanvas />
        <FormulaDetails />
      </div>
      <UserTour />
    </div>
  );
}
