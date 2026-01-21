let _logoutHandler = null;

export function setLogoutHandler(fn) {
  _logoutHandler = fn;
}

export function clearLogoutHandler() {
  _logoutHandler = null;
}

export function invokeLogout() {
  try {
    if (typeof _logoutHandler === 'function') _logoutHandler();
  } catch (e) {
    console.error('Logout handler failed', e);
  }
}

export default {
  setLogoutHandler,
  clearLogoutHandler,
  invokeLogout,
};
