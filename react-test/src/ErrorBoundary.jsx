import * as React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，以便下一次渲染将显示后备 UI。
    console.log(error);
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 上报错误到监控服务
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
    monitor.errorBoundary(error, info.componentStack);
    // 注意：React.captureOwnerStack() 仅在 React 19+ 开发模式下可用
    // if (process.env.NODE_ENV === 'development') {
    //   console.error("Owner Stack:", React.captureOwnerStack?.());
    // }
  }

  render() {
    if (this.state.hasError) {
      // 你可以渲染任何自定义后备 UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
