/// <reference types="vite/client" />

interface ElectronAPI {
  platform?: string;
  apiUrl?: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
