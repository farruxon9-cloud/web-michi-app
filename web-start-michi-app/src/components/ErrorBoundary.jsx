import React from 'react';
import { RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container fade-in">
          <div className="error-card glass">
            <div className="error-header">
              <div className="error-icon-box animate-pulse">
                <AlertTriangle size={32} color="#FF3B30" />
              </div>
              <h2>予期せぬエラーが発生しました / Unexpected Error</h2>
              <p className="error-subtitle">おっと! エラーが発生しました (Kutilmagan xatolik yuz berdi)</p>
            </div>

            <div className="error-body">
              <p className="error-message">
                ご迷惑をおかけして申し訳ありません。アプリを再読み込みして続行してください。
                (We apologize for the inconvenience. Please reload the app to continue.)
              </p>
              
              <button className="error-reload-btn" onClick={this.handleReload}>
                <RefreshCw size={16} />
                <span>再読み込み (Reload App)</span>
              </button>

              <div className="error-dev-section">
                <button className="error-dev-toggle" onClick={this.toggleDetails}>
                  <span>技術的詳細 (Developer Details)</span>
                  {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {this.state.showDetails && (
                  <div className="error-dev-details animate-slide-up">
                    <p className="error-name"><strong>Error:</strong> {this.state.error?.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="error-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
