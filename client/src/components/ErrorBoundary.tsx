import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kraken UI error:', error, info.componentStack);
    this.setState({ hasError: true, message: error?.message ?? 'Unknown error' });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            textAlign: 'center',
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Kraken&apos;s Lair crashed</div>
            <div style={{ opacity: 0.9, fontSize: 13, lineHeight: 1.4, maxWidth: 520, margin: '0 auto' }}>
              {this.state.message}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
