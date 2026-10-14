import { LOGO_PATH } from "@/lib/logo";

/** MXD X mark, traced from the supplied logo artwork. Inherits colour via currentColor. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  );
}
