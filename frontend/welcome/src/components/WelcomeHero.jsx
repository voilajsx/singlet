function WelcomeHero({ loading, error, serverInfo }) {
  return (
    <div className="text-center py-12">
      <div className="inline-block p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-6">
        <svg
          className="w-12 h-12 text-indigo-600 dark:text-indigo-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
        Welcome to Singlet
      </h1>
      
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        A minimal yet powerful application framework for building modern web applications
      </p>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400">{error}</div>
      ) : serverInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
            Server Information
          </h2>
          <div className="text-left space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Feature:</span> {serverInfo.feature}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Status:</span> {serverInfo.status}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Version:</span> {serverInfo.version}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">Timestamp:</span>{' '}
              {new Date(serverInfo.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeHero;