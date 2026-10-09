type P = { className?: string };

export const CartIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="20" r="1.5" fill="currentColor" />
    <circle cx="17" cy="20" r="1.5" fill="currentColor" />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const CheckCircle = ({ className }: P) => (
  <svg viewBox="0 0 96 96" fill="none" className={className} aria-hidden>
    <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="5" />
    <path d="M30 49l12 12 24-26" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDown = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Facebook = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" />
  </svg>
);

export const Instagram = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
  </svg>
);

export const Tiktok = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7Z" />
  </svg>
);
