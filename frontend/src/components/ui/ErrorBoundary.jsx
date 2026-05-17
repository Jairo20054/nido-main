import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', {
      message: error?.message || 'Unknown error',
      componentStack: info?.componentStack || null,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page">
          <section className="section">
            <div className="status-card status-card--empty">
              <span className="section__eyebrow">Error de interfaz</span>
              <h1>No pudimos cargar esta vista.</h1>
              <p>Actualiza la página o vuelve al inicio para continuar.</p>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
