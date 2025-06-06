declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    sw?: string;
    runtimeCaching?: any[];
    buildExcludes?: (string | RegExp)[];
    scope?: string;
    reloadOnOnline?: boolean;
    cacheOnFrontEndNav?: boolean;
    subdomainPrefix?: string;
    fallbacks?: {
      image?: string;
      document?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    publicExcludes?: (string | RegExp)[];
    manifestTransforms?: any[];
    additionalManifestEntries?: any[];
    dontCacheBustURLsMatching?: RegExp;
    modifyURLPrefix?: Record<string, string>;
    maximumFileSizeToCacheInBytes?: number;
    mode?: 'production' | 'development';
    navigateFallback?: string;
    navigateFallbackDenylist?: RegExp[];
    navigateFallbackAllowlist?: RegExp[];
    offlineGoogleAnalytics?: boolean | object;
    cleanupOutdatedCaches?: boolean;
    clientsClaim?: boolean;
    skipWaiting?: boolean;
    directoryIndex?: string;
    ignoreURLParametersMatching?: RegExp[];
    importScripts?: string[];
    chunks?: string[];
    exclude?: (string | RegExp)[];
    include?: (string | RegExp)[];
    swSrc?: string;
    webpackCompilationPlugins?: any[];
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
