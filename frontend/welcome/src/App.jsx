import { Button } from '@voilajsx/uikit/button';
import { ThemeProvider } from '@voilajsx/uikit/theme-provider';
import '@voilajsx/uikit/styles';

function App() {
  return (
    <ThemeProvider theme="ocean" variant="light">
      <Button variant="default" size="lg">
        Get Started
      </Button>
    </ThemeProvider>
  );
}

export default App;