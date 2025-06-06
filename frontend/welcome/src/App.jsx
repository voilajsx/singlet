import { useState, useEffect } from 'react';
import WelcomeHero from './components/WelcomeHero';
import FeatureList from './components/FeatureList';

function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch server info from the API
    fetch('/api/welcome/status')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setServerInfo(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching server info:', error);
        setError('Could not connect to server');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero 
          loading={loading} 
          error={error} 
          serverInfo={serverInfo} 
        />
        
        <FeatureList />
        
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            Powered by <span className="font-semibold">Singlet Framework</span>
            {serverInfo && serverInfo.version && (
              <span> v{serverInfo.version}</span>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;