export function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function MegaphoneIcon() {
  return (
    <svg viewBox="40 100 1520 1420" fill="currentColor" aria-hidden="true">
      <path d="M392 718C560 605 630 420 700 278q38-48 76-2l392 679q22 67-38 65c-170-10-370-35-536 47z" />
      <path d="M327 758l200 347-149 87A201 201 0 0 1 176 844z" />
      <path d="M445 1239l120-69 128 220a69 69 0 0 1-118 70z" />
      <path d="M984 483a110 110 0 0 1 109 189z" />
      <path d="M1104 276l76-133M1264 448l138-80M1332 672h155" fill="none" stroke="currentColor" strokeWidth="76" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square">
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

export function Stars({ className = "stars" }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="5 star rating">
      {[0, 1, 2, 3, 4].map((n) => (
        <span key={n} className="star" />
      ))}
    </span>
  );
}
