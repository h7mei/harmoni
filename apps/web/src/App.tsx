import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { LoginForm } from "./components/LoginForm.js";
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
  const { data: healthData } = useQuery(HEALTH);
  const { data: meData } = useQuery(ME, { skip: !authStore.isAuthenticated });

  useEffect(() => {
    authStore.hydrate();
  }, []);

  if (!authStore.isHydrated) {
    return <div>Loading...</div>;
  }

  if (!authStore.isAuthenticated) {
    return (
      <div className="app">
        <h1>Harmoni</h1>
        <LoginForm authStore={authStore} />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Harmoni</h1>
      <p>Health: {healthData?.health ?? "loading..."}</p>
      <p>User: {meData?.me?.name ?? authStore.user?.name ?? "loading..."}</p>
      <button onClick={() => authStore.clearAuth()}>Sign out</button>
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
