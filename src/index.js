import React, { lazy, Suspense, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import reportWebVitals from './reportWebVitals';
import { heroesNeedModdedRoster, loadModdedRoster } from './data/moddedRoster';
import { useModdedRoster } from './hooks/useModdedRoster';
import { readSettings } from './hooks/useSettings';
import { loadDraftTeam } from './utils/storageHelper';
import { compPayloadFromHash, decodeComp } from './utils/compLink';

// The ranking engine is a second app sharing this bundle; it lives at #/ranker
// so it works from the dev server and from a static build alike.
const RankerApp = lazy(() => import('./components/ranker/RankerApp'));

const routeFromHash = () => (window.location.hash.startsWith('#/ranker') ? 'ranker' : 'builder');

/**
 * Whether the Team Builder must wait for the modded roster before its first
 * render: a modded hero may not enter app state without it (see
 * `src/data/moddedRoster.js`), and these three put one there at boot.
 */
const builderBootNeedsModdedRoster = () => {
  if (readSettings().showModdedHeroes) return true;
  if (heroesNeedModdedRoster(loadDraftTeam()?.heroes)) return true;
  const payload = compPayloadFromHash(window.location.hash);
  return !!payload && heroesNeedModdedRoster(decodeComp(payload)?.heroes);
};

const Waiting = ({ children }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center text-dd-gold font-darkest text-xl px-4 text-center">
    {children}
  </div>
);

const Root = () => {
  const [route, setRoute] = useState(routeFromHash);
  const [builderNeedsRoster] = useState(builderBootNeedsModdedRoster);
  const [rosterFailed, setRosterFailed] = useState(false);
  const { loaded } = useModdedRoster(false);

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // The ranker always waits: it prunes class names it does not know from the
  // stored roster, and would save the pruned list over the real one.
  const needsRoster = route === 'ranker' || builderNeedsRoster;
  useEffect(() => {
    if (!needsRoster || loaded) return undefined;
    let live = true;
    loadModdedRoster().catch(() => {
      if (live) setRosterFailed(true);
    });
    return () => {
      live = false;
    };
  }, [needsRoster, loaded]);

  if (route === 'ranker') {
    if (!loaded) {
      return (
        <Waiting>
          {rosterFailed ? 'Could not load the hero roster. Reload to try again.' : 'Loading the Ranking Engine...'}
        </Waiting>
      );
    }
    return (
      <Suspense fallback={<Waiting>Loading the Ranking Engine...</Waiting>}>
        <RankerApp />
      </Suspense>
    );
  }

  // The builder degrades instead: without the roster a modded hero keeps its
  // names as written, which is what it already does with a mod it lacks.
  if (builderNeedsRoster && !loaded && !rosterFailed) {
    return <Waiting>Loading modded heroes...</Waiting>;
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
