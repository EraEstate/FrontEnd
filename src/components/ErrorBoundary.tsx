import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// A functional component to use hooks like `useTranslation`
const ErrorBoundaryFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('common.error.unexpected')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('common.error.unexpectedDescription') || 'Something went wrong while loading this page. Please try again.'}
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg overflow-auto max-h-48 text-sm font-mono text-gray-800">
             {error.toString()}
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {t('common.reload')}
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundaryClass;
