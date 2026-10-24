import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allows viewing the dev server from other devices on the same Wi-Fi
  // (e.g. http://192.168.100.10:3000) — otherwise Next.js blocks the
  // hot-reload/HMR requests from any origin other than localhost.
  allowedDevOrigins: ["192.168.100.10"],
  // La política de privacidad también responde en la URL con extensión.
  async rewrites() {
    return [
      { source: "/privacidad.html", destination: "/privacidad" },
      { source: "/terminos.html", destination: "/terminos" },
    ];
  },
};

export default nextConfig;
