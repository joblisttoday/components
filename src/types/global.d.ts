declare global {
  interface Window {
    L: any; // Leaflet
    twttr: any; // Twitter widgets
    instgrm: any; // Instagram widgets
    MWC_MANUAL_DEFINE: boolean; // From mwc.js
  }
}