import { contextBridge } from "electron";

const defaultApiUrl = "http://localhost:4000";

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  apiUrl: process.env.HARMONI_API_URL ?? defaultApiUrl,
});
