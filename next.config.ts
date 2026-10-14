import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async rewrites() {
    // Ad-matched landing: /?trade=plumbers is served from a prerendered /t/plumbers
    // page so the right trade is in the first paint, with no flash and no runtime cost.
    // The browser URL is unchanged, so UTM parameters stay readable client-side.
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "query", key: "trade", value: "(?<trade>roofers?|plumbers?|builders?|landscapers?)" }],
          destination: "/t/:trade",
        },
      ],
    };
  },
};

export default config;
