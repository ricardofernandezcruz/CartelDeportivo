import { cn } from "@/lib/utils";
import { SITE_SOCIALS } from "@/lib/site-socials";

type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8.25h2.25V5.5H14c-1.93 0-3.5 1.57-3.5 3.5v1.75H8.25V13.5H10.5V20h2.75v-6.5h2.1l.65-2.75h-2.75V9c0-.41.34-.75.75-.75Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.6 4H20l-6.2 7.1L20.9 20h-5.4l-4.2-5.5L6.2 20H3.8l6.6-7.6L3.2 4h5.5l3.8 5.1L17.6 4Zm-1 14.4h1.5L7.5 5.5H5.9l10.7 12.9Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Z" />
      <path d="M17.4 6.3a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0Z" />
      <path d="M12 3.5c2.2 0 2.5.01 3.38.05.86.04 1.45.18 1.97.39.54.21 1 .52 1.45.97.45.45.76.91.97 1.45.21.52.35 1.11.39 1.97.04.88.05 1.18.05 3.38s-.01 2.5-.05 3.38c-.04.86-.18 1.45-.39 1.97-.21.54-.52 1-.97 1.45-.45.45-.91.76-1.45.97-.52.21-1.11.35-1.97.39-.88.04-1.18.05-3.38.05s-2.5-.01-3.38-.05c-.86-.04-1.45-.18-1.97-.39a3.9 3.9 0 0 1-1.45-.97 3.9 3.9 0 0 1-.97-1.45c-.21-.52-.35-1.11-.39-1.97C3.51 14.5 3.5 14.2 3.5 12s.01-2.5.05-3.38c.04-.86.18-1.45.39-1.97.21-.54.52-1 .97-1.45.45-.45.91-.76 1.45-.97.52-.21 1.11-.35 1.97-.39C9.5 3.51 9.8 3.5 12 3.5Zm0-1.5c-2.24 0-2.52.01-3.41.05-.89.04-1.5.18-2.03.39a5.4 5.4 0 0 0-1.95 1.27 5.4 5.4 0 0 0-1.27 1.95c-.21.53-.35 1.14-.39 2.03C3.01 9.48 3 9.76 3 12s.01 2.52.05 3.41c.04.89.18 1.5.39 2.03.28.7.67 1.3 1.27 1.95.65.6 1.25.99 1.95 1.27.53.21 1.14.35 2.03.39.89.04 1.17.05 3.41.05s2.52-.01 3.41-.05c.89-.04 1.5-.18 2.03-.39a5.4 5.4 0 0 0 1.95-1.27 5.4 5.4 0 0 0 1.27-1.95c.21-.53.35-1.14.39-2.03.04-.89.05-1.17.05-3.41s-.01-2.52-.05-3.41c-.04-.89-.18-1.5-.39-2.03a5.4 5.4 0 0 0-1.27-1.95 5.4 5.4 0 0 0-1.95-1.27c-.53-.21-1.14-.35-2.03-.39C14.52 2.01 14.24 2 12 2Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28.4 28.4 0 0 0 2 12a28.4 28.4 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28.4 28.4 0 0 0 22 12a28.4 28.4 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.6 8.3a6.4 6.4 0 0 1-3.7-1.2v7.1a5.9 5.9 0 1 1-5.9-5.9c.2 0 .5 0 .7.05v2.9a3 3 0 1 0 2.1 2.9V2.5h2.8a6.4 6.4 0 0 0 4 3.8v2Z" />
    </svg>
  );
}

const iconByLabel = {
  Facebook: FacebookIcon,
  X: XIcon,
  Instagram: InstagramIcon,
  YouTube: YoutubeIcon,
  TikTok: TikTokIcon,
} as const;

export const siteSocialLinks = SITE_SOCIALS.map((item) => ({
  ...item,
  Icon: iconByLabel[item.label],
}));

export function SocialLinks({
  variant = "dark",
  className,
  iconClassName,
}: {
  variant?: "dark" | "light";
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {siteSocialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
            variant === "dark"
              ? "border border-white/20 text-white/85 hover:border-white hover:bg-white/10 hover:text-white"
              : "border border-border text-foreground/70 hover:border-[var(--cartel-red)] hover:text-[var(--cartel-red)]",
          )}
        >
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </a>
      ))}
    </div>
  );
}
