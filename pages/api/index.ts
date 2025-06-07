import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getApiRoutes = (): string[] => {
  const apiDir = path.join(process.cwd(), `pages`, `api`);
  let routes: string[] = [];

  const walk = (dir: string, baseRoute = ``) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath, `${baseRoute}/${file}`);
      } else if (file.endsWith(`.ts`) || file.endsWith(`.js`)) {
        const srtRoute = `${baseRoute}/${file.replace(/\.ts$|\.js$/, ``)}`;
        const noIndexRoute = srtRoute.replaceAll(`index`, ``);
        const noidxrt = noIndexRoute;
        const apiRoute = noIndexRoute.replace(`/`, `/api${noidxrt == `` ? `` : `/`}`);
        routes.push(apiRoute);
      }
    });
  };

  walk(apiDir);
  return routes;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === `GET`) {
    try {
      // Uptime
      let uptime = process.uptime();
      let uptimeHours = Math.floor(uptime / 3600);
      let uptimeMinutes = Math.floor((uptime % 3600) / 60);

      // System metrics
      let totalMem = os.totalmem() / (1024 * 1024 * 1024); // Convert to GB
      let freeMem = os.freemem() / (1024 * 1024 * 1024); // Convert to GB
      let usedMem = totalMem - freeMem;
      let cpuLoad = os.loadavg()[0]; // 1-minute load average. Might not directly translate to CPU %.

      // Disk space - You'll need a library like `diskusage` (node-diskusage on NPM) or a custom function
      // let { available, total } = await diskusage.check('/');
      // let usedDiskSpace = total - available;
      
      // Mock values for dependencies - Replace with actual health checks
      let databaseStatus = `Connected`; // Implement your actual database health check
      let externalApiStatus = `Connected`; // Implement your actual external API health check

      // Application metrics - These would be based on your application's specific metrics
      let requestLatency = `200 ms average`; // Implement actual measurement
      let errorRate = `0.5%`; // Implement actual measurement
      let activeSessions = 142; // Implement actual measurement

      res.status(200).json({
        A: `ProductIVF`,
        status: `Healthy`,
        routes: getApiRoutes(),
        timestamp: new Date().toISOString(),
        uptime: `${uptimeHours} hours, ${uptimeMinutes} minutes`,
        systemMetrics: {
          memoryUsage: `${usedMem.toFixed(2)} GB of ${totalMem.toFixed(2)} GB`,
          diskSpace: `XY GB of XY GB`, // Replace with actual disk space usage after implementing disk usage check
          cpuLoad: `${cpuLoad.toFixed(2)}`, // Note: This is a load average, not a CPU percentage
        },
        dependencies: {
          database: databaseStatus,
          externalApi: externalApiStatus,
          redisCache: `Connected`, // Implement actual health check
          rabbitMq: `Connected`, // Implement actual health check
        },
        applicationMetrics: {
          requestLatency: requestLatency,
          errorRate: errorRate,
          activeSessions: activeSessions,
        },
        security: {
          sslExpiry: `2025-01-01`, // Implement actual SSL expiry check
          compliance: `GDPR compliant` // This might be static or based on some compliance checks
        }
      });
    } catch (error) {
      res.status(500).json({ error: `Server is in Error State` });
    }
  } else {
    res.status(405).json({ error: `Server is in Error State` });
  }
}