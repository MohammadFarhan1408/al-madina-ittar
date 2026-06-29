/**
 * App-level error boundary. Renders a branded fallback (must live inside ThemeProvider
 * so the fallback can use the theme). Catches render-time errors in feature trees.
 */
import { Component, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';

import { IconSize } from '@/constants';
import { EmptyState } from '@/components/ui';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // TODO(observability): forward to crash reporting once configured.
    if (__DEV__) console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <EmptyState
            icon={<TriangleAlert size={IconSize.xxl} color="#B23A48" strokeWidth={1.5} />}
            title="Something went wrong"
            message="An unexpected error occurred. Please try again."
            actionLabel="Reload"
            onAction={this.reset}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({ root: { flex: 1 } });
