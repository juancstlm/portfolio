import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // next dev would otherwise write an AGENTS.md into the repo; agent notes stay out of this public repo.
  agentRules: false,
};

export default nextConfig;
