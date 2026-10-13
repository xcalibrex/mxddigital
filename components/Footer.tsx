export function Footer() {
  return (
    <footer className="footer has-arches">
      <div className="arches" aria-hidden="true" />
      <div className="wrap footer-row">
        <span className="small">Websites · Paid ads · For the trades</span>
        <span className="small">© {new Date().getFullYear()} MXD Digital</span>
      </div>
      <div className="wordmark display up" aria-hidden="true">
        M<span className="accent">X</span>D DIGITAL
      </div>
    </footer>
  );
}
