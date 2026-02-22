export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncMessage<T = unknown> {
  type: "create" | "update" | "delete";
  entity: string;
  id: string;
  payload?: T;
  timestamp: string;
}
