import React from 'react';

/**
 * ErrorBoundary — Catches unhandled rendering errors in child components.
 * Displays a premium error UI instead of a blank screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#040507',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem',
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
          textAlign: 'center',
        }}>
          {/* Animated error icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 23, 68, 0.1)',
            border: '2px solid rgba(255, 23, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '2rem',
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#ff1744',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}>
            System Anomaly Detected
          </h1>

          <p style={{
            color: '#a1aabf',
            fontSize: '0.95rem',
            maxWidth: 500,
            lineHeight: 1.7,
            marginBottom: '2rem',
          }}>
            An unexpected rendering error occurred. Our systems have logged this incident.
            You can return to the home screen and continue browsing.
          </p>

          {/* Error details (dev mode only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              background: 'rgba(255,23,68,0.05)',
              border: '1px solid rgba(255,23,68,0.2)',
              borderRadius: 12,
              padding: '1rem 1.5rem',
              marginBottom: '2rem',
              maxWidth: 600,
              textAlign: 'left',
              cursor: 'pointer',
            }}>
              <summary style={{ color: '#ff1744', fontWeight: 600, marginBottom: '0.5rem' }}>
                Error Details (Development)
              </summary>
              <pre style={{ color: '#a1aabf', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #00ff9d, #00cc7a)',
              color: '#050505',
              border: 'none',
              borderRadius: 12,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,255,157,0.3)',
              transition: 'transform 0.15s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
