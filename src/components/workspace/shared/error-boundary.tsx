"use client";

import { Component, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  error: Error | null;
}

/**
 * Generic React Error Boundary.
 *
 * Catches rendering errors in the subtree and renders a fallback instead
 * of crashing the entire component tree.  Supports reset() to re-render
 * the children after recovery (e.g. user clicks "Retry").
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }
      return fallback;
    }
    return this.props.children;
  }
}
