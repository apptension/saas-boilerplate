import React from 'react';

interface NotificationErrorBoundaryState {
  hasError: boolean;
}

type NotificationErrorBoundaryProps = {
  children?: React.ReactNode;
}

export class NotificationErrorBoundary extends React.Component<NotificationErrorBoundaryProps, NotificationErrorBoundaryState> {
  constructor(props: NotificationErrorBoundaryProps) {
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
