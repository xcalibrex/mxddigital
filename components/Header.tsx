import { ArrowIcon } from "./Icons";
import { LogoMark } from "./Logo";

export function Header() {
  return (
    <header className="header wrap fade d0">
      <a href="#top" className="logo" aria-label="MXD Digital, back to top">
        <LogoMark className="logo-x" />
        <span className="logo-mark display">
          M<span className="accent">X</span>D Digital
        </span>
      </a>
      <a href="#start" className="navcta">
        Get started
        <ArrowIcon />
      </a>
    </header>
  );
}
