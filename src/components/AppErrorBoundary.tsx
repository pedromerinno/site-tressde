import * as React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AppErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground"
          role="alert"
        >
          <h1 className="text-lg font-semibold mb-2">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Se o problema continuar, confira na Vercel se as variáveis{" "}
            <code className="bg-muted px-1 rounded">VITE_SUPABASE_URL</code> e{" "}
            <code className="bg-muted px-1 rounded">VITE_SUPABASE_ANON_KEY</code> estão definidas.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm font-medium text-primary hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
