import { LandingProvider } from "./LandingState";
import { Header } from "./Header";
import { Hero, HeroMedia } from "./Hero";
import { Statement } from "./Statement";
import { Services } from "./Services";
import { Results } from "./Results";
import { Work } from "./Work";
import { Faq } from "./Faq";
import { WizardSection } from "./Wizard";
import { Footer } from "./Footer";
import { StickyCta } from "./StickyCta";

/** The whole landing page. `locked` = ad-matched visit: start on that trade, no rotation. */
export function Landing({ initialTrade = 0, locked = false }: { initialTrade?: number; locked?: boolean }) {
  return (
    <LandingProvider initialTrade={initialTrade} locked={locked}>
      <div className="mxd">
        <div className="arches" aria-hidden="true" />
        <Header />
        <main>
          <Hero />
          <HeroMedia />
          <Statement />
          <Services />
          <Results />
          <Work />
          <Faq />
          <WizardSection />
        </main>
        <Footer />
        <StickyCta />
      </div>
    </LandingProvider>
  );
}
