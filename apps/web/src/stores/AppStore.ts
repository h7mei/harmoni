import { makeAutoObservable } from "mobx";

export class AppStore {
  sidebarCollapsed = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
