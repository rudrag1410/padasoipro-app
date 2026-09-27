/**
 * Lets the HTTP client read the current token and report a rejected session
 * without importing React state. The AuthProvider registers itself here.
 */
type Listener = () => void;

let currentToken: string | null = null;
let unauthorizedListener: Listener | null = null;

export const sessionBridge = {
  getToken: () => currentToken,
  setToken: (token: string | null) => {
    currentToken = token;
  },
  onUnauthorized: (listener: Listener | null) => {
    unauthorizedListener = listener;
  },
  notifyUnauthorized: () => unauthorizedListener?.(),
};
