import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { LoginForm } from "./components/LoginForm.js";
import { AppSidebar, DashboardContent } from "./components/Dashboard.js";
import { authStore } from "./stores/AuthStore.js";

const HEALTH = gql`
  query Health {
    health
  }
`;

const ME = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`;

const AppInner = observer(function AppInner() {
  useQuery(HEALTH);
  useQuery(ME, { skip: !authStore.isAuthenticated });

  useEffect(() => {
    authStore.hydrate();
  }, []);

  if (!authStore.isHydrated) {
    return <div>Loading...</div>;
  }

  if (!authStore.isAuthenticated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4">
        <h1 className="mb-6 text-2xl font-semibold">Harmoni</h1>
        <LoginForm authStore={authStore} />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      <AppSidebar authStore={authStore} />
      <main className="flex-1 overflow-hidden">
        <DashboardContent />
      </main>
    </div>
  );
});

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
