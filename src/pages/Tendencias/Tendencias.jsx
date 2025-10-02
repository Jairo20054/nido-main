import React, { useState, useEffect } from 'react';
import './Tendencias.css';

// ========== COMPONENTES DE ICONOS ==========
const TrendingUpIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TrendingDownIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const DollarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const CalendarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const BarChartIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const PieChartIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
);

const RefreshIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
);

const Tendencias = () => {
  // ========== ESTADOS ==========
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedMetric, setSelectedMetric] = useState('precios');
  const [isLoading, setIsLoading] = useState(false);

  // ========== DATOS MOCK DE TENDENCIAS ==========
  const [marketData] = useState({
    precios: {
      mes: {
        promedio: 2850000,
        cambio: 5.2,
        tendencia: 'up',
        datos: [2800000, 2750000, 2850000, 2900000, 2950000, 2850000]
      },
      trimestre: {
        promedio: 2750000,
        cambio: 8.7,
        tendencia: 'up',
        datos: [2650000, 2700000, 2750000, 2800000, 2850000, 2900000]
      },
      año: {
        promedio: 2600000,
        cambio: -2.1,
        tendencia: 'down',
        datos: [2550000, 2580000, 2600000, 2650000, 2680000, 2620000]
      }
    },
    ventas: {
      mes: {
        total: 245,
        cambio: 12.5,
        tendencia: 'up',
        datos: [220, 235, 240, 245, 250, 245]
      },
      trimestre: {
        total: 720,
        cambio: 15.8,
        tendencia: 'up',
        datos: [650, 680, 700, 720, 735, 720]
      },
      año: {
        total: 2850,
        cambio: -5.2,
        tendencia: 'down',
        datos: [2800, 2820, 2850, 2880, 2900, 2850]
      }
    },
    demanda: {
      mes: {
        zonas: [
          { nombre: 'Centro', demanda: 85, cambio: 10.5 },
          { nombre: 'Norte', demanda: 72, cambio: 8.2 },
          { nombre: 'Sur', demanda: 68, cambio: -3.1 },
          { nombre: 'Occidente', demanda: 55, cambio: 15.7 }
        ]
      },
      trimestre: {
        zonas: [
          { nombre: 'Centro', demanda: 82, cambio: 12.3 },
          { nombre: 'Norte', demanda: 75, cambio: 6.8 },
          { nombre: 'Sur', demanda: 70, cambio: 2.9 },
          { nombre: 'Occidente', demanda: 58, cambio: 18.2 }
        ]
      },
      año: {
        zonas: [
          { nombre: 'Centro', demanda: 78, cambio: -5.4 },
          { nombre: 'Norte', demanda: 68, cambio: -8.1 },
          { nombre: 'Sur', demanda: 65, cambio: 4.8 },
          { nombre: 'Occidente', demanda: 52, cambio: 13.0 }
        ]
      }
    }
  });

  // ========== MANEJADORES ==========
  const handlePeriodChange = (period) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // ========== DATOS CALCULADOS ==========
  const currentData = marketData[selectedMetric]?.[selectedPeriod] || {};
  const formatCurrency = (value) => `$${value.toLocaleString()}`;
  const formatPercentage = (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  // ========== COMPONENTE DE GRÁFICO SIMPLE ==========
  const SimpleChart = ({ data, color = '#4299e1' }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    return (
      <div className="simple-chart">
        <svg width="100%" height="60" viewBox="0 0 200 60">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 180 + 10;
              const y = 50 - ((value - minValue) / (maxValue - minValue)) * 40;
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 180 + 10;
            const y = 50 - ((value - minValue) / (maxValue - minValue)) * 40;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // ========== RENDERIZADO ==========
  return (
    <div className="tendencias">
      {/* Header con controles */}
      <div className="tendencias-header">
        <div className="header-content">
          <h1 className="tendencias-title">Tendencias del Mercado</h1>
          <p className="tendencias-subtitle">Análisis en tiempo real del mercado inmobiliario</p>
        </div>

        <div className="header-controls">
          <button
            className="refresh-btn"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshIcon />
            <span>Actualizar</span>
          </button>

          <div className="period-selector">
            <button
              className={`period-btn ${selectedPeriod === 'mes' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('mes')}
            >
              Mes
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'trimestre' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('trimestre')}
            >
              Trimestre
            </button>
            <button
              className={`period-btn ${selectedPeriod === 'año' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('año')}
            >
              Año
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores principales */}
      <div className="main-indicators">
        <div className="indicator-card">
          <div className="indicator-header">
            <div className="indicator-icon">
              <DollarIcon />
            </div>
            <div className="indicator-info">
              <h3 className="indicator-title">Precio Promedio</h3>
              <div className="indicator-trend">
                {currentData.tendencia === 'up' ? (
                  <TrendingUpIcon className="trend-up" />
                ) : (
                  <TrendingDownIcon className="trend-down" />
                )}
                <span className={`trend-value ${currentData.tendencia}`}>
                  {formatPercentage(currentData.cambio)}
                </span>
              </div>
            </div>
          </div>
          <div className="indicator-value">
            {formatCurrency(currentData.promedio || 0)}
          </div>
          <SimpleChart data={currentData.datos || []} color="#4299e1" />
        </div>

        <div className="indicator-card">
          <div className="indicator-header">
            <div className="indicator-icon">
              <HomeIcon />
            </div>
            <div className="indicator-info">
              <h3 className="indicator-title">Ventas Totales</h3>
              <div className="indicator-trend">
                {currentData.tendencia === 'up' ? (
                  <TrendingUpIcon className="trend-up" />
                ) : (
                  <TrendingDownIcon className="trend-down" />
                )}
                <span className={`trend-value ${currentData.tendencia}`}>
                  {formatPercentage(currentData.cambio)}
                </span>
              </div>
            </div>
          </div>
          <div className="indicator-value">
            {currentData.total?.toLocaleString() || 0}
          </div>
          <SimpleChart data={currentData.datos || []} color="#48bb78" />
        </div>

        <div className="indicator-card">
          <div className="indicator-header">
            <div className="indicator-icon">
              <BarChartIcon />
            </div>
            <div className="indicator-info">
              <h3 className="indicator-title">Demanda por Zona</h3>
              <div className="indicator-trend">
                <span className="trend-neutral">Análisis</span>
              </div>
            </div>
          </div>
          <div className="indicator-value">
            {marketData.demanda[selectedPeriod]?.zonas?.length || 0} Zonas
          </div>
          <div className="demand-preview">
            {marketData.demanda[selectedPeriod]?.zonas?.slice(0, 3).map((zona, index) => (
              <div key={index} className="demand-item">
                <span className="zone-name">{zona.nombre}</span>
                <span className={`zone-demand ${zona.cambio > 0 ? 'positive' : zona.cambio < 0 ? 'negative' : 'neutral'}`}>
                  {zona.demanda}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="tendencias-content">
        {/* Gráfico detallado */}
        <div className="chart-section">
          <div className="chart-header">
            <h2 className="chart-title">
              {selectedMetric === 'precios' && 'Evolución de Precios'}
              {selectedMetric === 'ventas' && 'Tendencia de Ventas'}
              {selectedMetric === 'demanda' && 'Demanda por Zonas'}
            </h2>

            <div className="metric-selector">
              <button
                className={`metric-btn ${selectedMetric === 'precios' ? 'active' : ''}`}
                onClick={() => handleMetricChange('precios')}
              >
                <DollarIcon />
                <span>Precios</span>
              </button>
              <button
                className={`metric-btn ${selectedMetric === 'ventas' ? 'active' : ''}`}
                onClick={() => handleMetricChange('ventas')}
              >
                <HomeIcon />
                <span>Ventas</span>
              </button>
              <button
                className={`metric-btn ${selectedMetric === 'demanda' ? 'active' : ''}`}
                onClick={() => handleMetricChange('demanda')}
              >
                <BarChartIcon />
                <span>Demanda</span>
              </button>
            </div>
          </div>

          <div className="chart-container">
            {selectedMetric === 'demanda' ? (
              <div className="demand-chart">
                {marketData.demanda[selectedPeriod]?.zonas?.map((zona, index) => (
                  <div key={index} className="demand-bar">
                    <div className="bar-info">
                      <span className="zone-name">{zona.nombre}</span>
                      <span className="zone-percentage">{zona.demanda}%</span>
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${zona.demanda}%` }}
                      ></div>
                    </div>
                    <div className="zone-change">
                      <span className={`change-value ${zona.cambio > 0 ? 'positive' : zona.cambio < 0 ? 'negative' : 'neutral'}`}>
                        {formatPercentage(zona.cambio)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="line-chart-placeholder">
                <div className="chart-placeholder-content">
                  <BarChartIcon size={48} />
                  <p>Gráfico de {selectedMetric === 'precios' ? 'precios' : 'ventas'}</p>
                  <small>Período: {selectedPeriod}</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral con insights */}
        <div className="insights-panel">
          <h3 className="insights-title">Insights del Mercado</h3>

          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">
                <TrendingUpIcon />
              </div>
              <div className="insight-content">
                <h4 className="insight-title">Tendencia Alcista</h4>
                <p className="insight-description">
                  Los precios han aumentado un {formatPercentage(currentData.cambio || 0)} en el último {selectedPeriod}.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-icon">
                <HomeIcon />
              </div>
              <div className="insight-content">
                <h4 className="insight-title">Zona Más Demandada</h4>
                <p className="insight-description">
                  El Centro lidera con {marketData.demanda[selectedPeriod]?.zonas?.[0]?.demanda || 0}% de demanda.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-icon">
                <CalendarIcon />
              </div>
              <div className="insight-content">
                <h4 className="insight-title">Momento Óptimo</h4>
                <p className="insight-description">
                  Los mejores precios se encontraron entre las 2-4 PM los fines de semana.
                </p>
              </div>
            </div>

            <div className="insight-item">
              <div className="insight-icon">
                <PieChartIcon />
              </div>
              <div className="insight-content">
                <h4 className="insight-title">Distribución por Tipo</h4>
                <p className="insight-description">
                  45% apartamentos, 35% casas, 20% otros tipos de propiedad.
                </p>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="recommendations-section">
            <h4 className="recommendations-title">Recomendaciones</h4>
            <ul className="recommendations-list">
              <li>Considerar inversiones en el Centro para máxima rentabilidad</li>
              <li>Los precios de apartamentos muestran mayor estabilidad</li>
              <li>Época óptima para venta: próximos 3 meses</li>
              <li>Demanda creciente en zonas occidentales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <RefreshIcon />
            <span>Actualizando datos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tendencias;
