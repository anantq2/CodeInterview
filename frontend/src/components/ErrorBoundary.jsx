import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
                    <div className="card bg-base-100 shadow-2xl max-w-lg w-full">
                        <div className="card-body items-center text-center">
                            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-10 h-10 text-error"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>

                            <h2 className="card-title text-2xl font-bold">
                                Oops! Something went wrong
                            </h2>

                            <p className="text-base-content/70 mt-2">
                                An unexpected error occurred. Please try again or refresh the page.
                            </p>

                            {this.state.error && (
                                <div className="mt-4 p-3 bg-base-200 rounded-lg w-full">
                                    <p className="text-xs text-error font-mono break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="card-actions mt-6 gap-3">
                                <button
                                    className="btn btn-primary"
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
