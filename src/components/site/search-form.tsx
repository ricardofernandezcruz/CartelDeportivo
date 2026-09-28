"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Equipos, ligas, jugadores…"
          className="pl-9"
        />
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  );
}
