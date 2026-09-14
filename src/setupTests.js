// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { installModdedRoster } from './data/moddedRoster';
import * as moddedHeroes from './data/modded_heroes';
import * as moddedEffectsGenerated from './data/moddedEffectsGenerated';

// The app loads the modded roster on demand (src/data/moddedRoster.js). Suites
// start with it installed, so they read modded classes the way they always
// have; the suites about loading it reset it themselves.
installModdedRoster(moddedHeroes, moddedEffectsGenerated);
