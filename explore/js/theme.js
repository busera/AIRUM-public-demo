const STORAGE_KEY = 'airum-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const SUN_ICON = '<span class="theme-toggle-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" role="img"><circle cx="12" cy="12" r="4.2"></circle><path d="M12 2.8v3M12 18.2v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.8 12h3M18.2 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg></span>';
const MOON_ICON = '<span class="theme-toggle-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false" role="img"><path d="M19.2 14.6A7.2 7.2 0 0 1 9.4 4.8 7.8 7.8 0 1 0 19.2 14.6Z"></path></svg></span>';

function storedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function preferredTheme() {
  const stored = storedTheme();
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
    button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  });
}

function persistTheme(theme) {
  try {
    localStorage.setItem('airum-theme', theme);
  } catch {
    // Ignore storage failures; the toggle still works for the current page.
  }
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  persistTheme(nextTheme);
  applyTheme(nextTheme);
}

function bindThemeToggles() {
  applyTheme(preferredTheme());
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', toggleTheme);
  });
}

applyTheme(preferredTheme());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindThemeToggles, { once: true });
} else {
  bindThemeToggles();
}
