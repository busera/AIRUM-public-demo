const STORAGE_KEY = 'airum-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

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
    button.textContent = theme === 'dark' ? '☀' : '☾';
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
