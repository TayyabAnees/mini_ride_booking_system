import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Do not show anything visually
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Just render children, or a fallback UI if you want
            return this.props.fallback || null;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
