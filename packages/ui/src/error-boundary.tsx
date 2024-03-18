import React from 'react';
import { Box } from 'coral-system';
import { logger } from '@music163/tango-helpers';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    logger.error(error);
    return { hasError: true };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    logger.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box as="h1" color="red">
          Something went wrong.
        </Box>
      );
    }

    return this.props.children;
  }
}
