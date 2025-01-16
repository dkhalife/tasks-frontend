import { QueryClient, QueryClientProvider } from 'react-query'
import React from 'react'

interface QueryContextProps {
  children: React.ReactNode;
}

export class QueryContext extends React.Component<QueryContextProps> {
  private queryClient: QueryClient = new QueryClient();

  public render(): JSX.Element {
    return (
      <QueryClientProvider client={this.queryClient}>
        {this.props.children}
      </QueryClientProvider>
    );
  }
}
