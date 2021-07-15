import React from 'react';

interface NotificationErrorBoundaryState {
  hasError: boolean;
}

export class NotificationErrorBoundary extends React.Component<unknown, NotificationErrorBoundaryState> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
