import { calculate } from './calc/recipe';
const DEFAULT_STATE = {
    hydration: 72,
    saltPct: 2,
    flourBlend: [
        { grain: 'Weizen', type: 'Ruchmehl', grams: 500 },
    ],
    levain: {
        mode: 'A',
        starterHydration: 50,
        levainPct: 20,
        flourGrain: 'Weizen',
        flourType: 'Weissmehl',
    },
    autolyse: {
        enabled: false,
        autolyseWaterPct: 80,
        bassinageWaterPct: 10,
    },
    fermentation: {
        enabled: false,
        direction: 'timeFromLevain',
        levainPct: 20,
        targetHours: 4,
        temperature: 22,
        referenceTemp: 20,
        referenceLevainPct: 20,
        referenceTimeHours: 4,
    },
};
function loadInitialState() {
    const imported = sessionStorage.getItem('bread-import');
    if (imported) {
        sessionStorage.removeItem('bread-import');
        try {
            return JSON.parse(imported);
        }
        catch {
            // fall through to default
        }
    }
    return structuredClone(DEFAULT_STATE);
}
let state = loadInitialState();
let result = calculate(state);
const subscribers = [];
export function getState() {
    return state;
}
export function getResult() {
    return result;
}
export function setState(patch) {
    state = { ...state, ...patch };
    result = calculate(state);
    subscribers.forEach(fn => fn(result, state));
}
export function subscribe(fn) {
    subscribers.push(fn);
}
/** Trigger all subscribers with current state (used on initial render). */
export function notify() {
    subscribers.forEach(fn => fn(result, state));
}
