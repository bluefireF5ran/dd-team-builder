import React, { lazy, Suspense, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import reportWebVitals from './reportWebVitals';

// The ranking engine is a second app sharing this bundle; it lives at #/ranker
// so it works from the dev server and from a static build alike.
const RankerApp = lazy(() => import('./components/ranker/RankerApp'));

const routeFromHash = () => (window.location.hash.startsWith('#/ranker') ? 'ranker' : 'builder');

const Root = () => {
  const [route, setRoute] = useState(routeFromHash);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === 'ranker') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center text-dd-gold font-darkest text-xl">
            Loading the Ranking Engine...
          </div>
        }
      >
        <RankerApp />
      </Suspense>
    );
  }

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
