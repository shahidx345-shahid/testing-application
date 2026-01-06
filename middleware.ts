// Middleware disabled due to Turbopack edge runtime issues
// Page-level protection is handled in React components instead
// API-level protection uses JWT validation in route handlers

export function middleware() {
  // Empty middleware - all protection handled at component/API level
}

export const config = {
  matcher: [],
};
