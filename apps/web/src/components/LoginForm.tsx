import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { observer } from "mobx-react-lite";
import type { AuthStore } from "../stores/AuthStore.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";

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
    <Card className="w-full max-w-sm border-border bg-card shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Sign in" : "Create account"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your email and password to sign in."
            : "Enter your details to create an account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="w-full"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full"
            />
            {mode === "register" && (
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn("w-full text-muted-foreground")}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
