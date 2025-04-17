import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
     'http://0.0.0.0:3000',           // all interfaces
     'http://localhost:3000',        // loopback
     'http://127.0.0.1:3000',        // loopback
     'http://192.168.0.0/16',        // all 192.168.x.x IPs
     'http://10.0.0.0/8',            // all 10.x.x.x IPs
     'http://172.16.0.0/12'          // all 172.16.x.x IPs
   ]
};

export default nextConfig;
