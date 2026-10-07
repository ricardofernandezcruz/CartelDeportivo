"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SITE_TZ_IANA,
  SITE_TZ_LABEL,
  isoToSantoDomingoFields,
  santoDomingoToIso,
} from "@/lib/timezone";

export function DatetimeRd({
  id,
  label = "Fecha y hora",
  valueIso,
  onChangeIso,
}: {
  id?: string;
  label?: string;
  valueIso: string;
  onChangeIso: (iso: string) => void;
}) {
  const synced = isoToSantoDomingoFields(valueIso || null);
  const [date, setDate] = useState(synced.date);
  const [time, setTime] = useState(synced.time);

  useEffect(() => {
    const next = isoToSantoDomingoFields(valueIso || null);
    setDate(next.date);
    setTime(next.time);
  }, [valueIso]);

  function emit(nextDate: string, nextTime: string) {
    if (!nextDate.trim() && !nextTime.trim()) {
      onChangeIso("");
      return;
    }
    const iso = santoDomingoToIso(nextDate, nextTime);
    if (iso) onChangeIso(iso);
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          id={id}
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          autoComplete="off"
          value={date}
          onChange={(e) => {
            const v = e.target.value;
            setDate(v);
            emit(v, time);
          }}
          className="bg-background"
          aria-describedby={id ? `${id}-tz` : undefined}
        />
        <Input
          type="time"
          value={time}
          onChange={(e) => {
            const v = e.target.value;
            setTime(v);
            emit(date, v);
          }}
          className="bg-background w-[7.5rem]"
          aria-label="Hora"
        />
      </div>
      <p id={id ? `${id}-tz` : undefined} className="text-[11px] text-muted-foreground">
        Formato dd/mm/aaaa · {SITE_TZ_LABEL} ({SITE_TZ_IANA})
      </p>
    </div>
  );
}
