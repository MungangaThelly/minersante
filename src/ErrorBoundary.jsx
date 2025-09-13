import React from 'react';
import i18next from 'i18next';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-screen">{i18next.t('error')}</div>;
    }
    return this.props.children;
  }
}
