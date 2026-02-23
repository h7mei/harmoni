import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { observer } from "mobx-react-lite";
import type { AuthStore } from "../stores/AuthStore.js";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user { id email name createdAt updatedAt }
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

const REGISTER = gql`
  mutation Register($email: String!, $name: String!, $password: String!) {
    register(email: $email, name: $name, password: $password) {
      user { id email name createdAt updatedAt }
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

export const LoginForm = observer(function LoginForm({
  authStore,
  onSuccess,
}: {
  authStore: AuthStore;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [login, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      authStore.setAuth({
        user: data.login.user,
        accessToken: data.login.accessToken,
        refreshToken: data.login.refreshToken,
      });
      onSuccess?.();
    },
    onError: (err) => setError(err.message),
  });

  const [register, { loading: registerLoading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      authStore.setAuth({
        user: data.register.user,
        accessToken: data.register.accessToken,
        refreshToken: data.register.refreshToken,
      });
      onSuccess?.();
    },
    onError: (err) => setError(err.message),
  });

  const loading = loginLoading || registerLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "login") {
      login({ variables: { email, password } });
    } else {
      register({ variables: { email, name, password } });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: "0 auto", fontFamily: "system-ui" }}>
      <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <div style={{ marginBottom: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      {mode === "register" && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? 8 : 1}
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <button type="submit" disabled={loading} style={{ padding: 8, marginRight: 8 }}>
        {loading ? "..." : mode === "login" ? "Sign in" : "Register"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
      >
        {mode === "login" ? "Create account" : "Sign in instead"}
      </button>
    </form>
  );
});
