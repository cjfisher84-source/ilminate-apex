// Lightweight logging utility for troubleshooting UI and theme issues
export const log = {
  theme: (...args: any[]) => console.debug('[THEME]', ...args),
  ui: (...args: any[]) => console.debug('[UI]', ...args),
  chart: (...args: any[]) => console.debug('[CHART]', ...args),
  table: (...args: any[]) => console.debug('[TABLE]', ...args),
  auth: (...args: any[]) => console.debug('[AUTH]', ...args),
};

