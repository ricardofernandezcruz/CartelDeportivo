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
        <Label htmlFor="email" className="sr-only">
          Correo
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico*"
          className="h-11 rounded-xl bg-white"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="sr-only">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña*"
          className="h-11 rounded-xl bg-white"
          required
        />
      </div>
      {error && <p className="text-sm text-[var(--cartel-red)]">{error}</p>}
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-[var(--cartel-red)] text-sm font-semibold text-white hover:bg-[var(--cartel-red)]/90"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}
