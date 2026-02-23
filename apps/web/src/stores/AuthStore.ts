import { makeAutoObservable } from "mobx";
import { cache } from "../lib/cache.js";

const ACCESS_TOKEN_KEY = "harmoni:accessToken";
const REFRESH_TOKEN_KEY = "harmoni:refreshToken";
const USER_KEY = "harmoni:user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export class AuthStore {
  user: AuthUser | null = null;
  accessToken: string | null = null;
  isHydrated = false;

  constructor() {
    makeAutoObservable(this);
  }

  async hydrate() {
    if (this.isHydrated) return;
    const [token, user] = await Promise.all([
      cache.get<string>(ACCESS_TOKEN_KEY),
      cache.get<AuthUser>(USER_KEY),
    ]);
    this.accessToken = token ?? null;
    this.user = user ?? null;
    this.isHydrated = true;
  }

  setAuth(payload: { user: AuthUser; accessToken: string; refreshToken: string }) {
    this.user = payload.user;
    this.accessToken = payload.accessToken;
    Promise.all([
      cache.set(ACCESS_TOKEN_KEY, payload.accessToken),
      cache.set(REFRESH_TOKEN_KEY, payload.refreshToken),
      cache.set(USER_KEY, payload.user),
    ]);
  }

  clearAuth() {
    this.user = null;
    this.accessToken = null;
    Promise.all([
      cache.del(ACCESS_TOKEN_KEY),
      cache.del(REFRESH_TOKEN_KEY),
      cache.del(USER_KEY),
    ]);
  }

  get isAuthenticated() {
    return Boolean(this.accessToken && this.user);
  }
}

export const authStore = new AuthStore();
