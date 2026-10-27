import { Component, type ReactNode } from 'react';

interface Props {
  onError: (error: unknown) => void;
  children: ReactNode;
}

/** Catches a failing 3D view (for example a lost WebGL context) so the app can fall back to 2D. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
