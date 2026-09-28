"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState("editor@carteldeportivo.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectTo.startsWith("/") ? redirectTo : "/admin");

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar al panel"}
      </Button>
    </form>
  );
}
