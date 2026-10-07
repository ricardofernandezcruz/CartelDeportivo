import { siteOrigin } from "@/lib/site";

const RESEND_URL = "https://api.resend.com/emails";

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress() {
  return process.env.NEWSLETTER_FROM || "Cartel Deportivo <noreply@carteldeportivo.com>";
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, skipped: true as const };

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend error", res.status, detail.slice(0, 400));
    return { ok: false as const, skipped: false as const };
  }
  return { ok: true as const, skipped: false as const };
}

export async function sendEmailBatch(
  messages: Array<{ to: string; subject: string; html: string }>,
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, skipped: true as const, sent: 0 };
  if (!messages.length) return { ok: true as const, skipped: false as const, sent: 0 };

  const from = fromAddress();
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch(`${RESEND_URL}/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chunk.map((m) => ({ from, to: [m.to], subject: m.subject, html: m.html }))),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend batch error", res.status, detail.slice(0, 400));
      return { ok: false as const, skipped: false as const, sent };
    }
    sent += chunk.length;
  }
  return { ok: true as const, skipped: false as const, sent };
}

export function welcomeEmailHtml(email: string) {
  const origin = siteOrigin();
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#C8102E;font-weight:700">Cartel Deportivo</p>
      <h1 style="font-size:24px;line-height:1.1">Ya estás en el boletín</h1>
      <p>Te avisamos cuando salga una nota fuerte: LIDOM, MLB, fútbol y el resto del cartel.</p>
      <p><a href="${origin}" style="color:#0077C8">Ver portada</a></p>
      <p style="font-size:12px;color:#666">Si no fuiste tú, <a href="${origin}/boletin/salir?email=${encodeURIComponent(email)}">cancela la suscripción</a>.</p>
    </div>
  `;
}

export function digestEmailHtml(
  articles: Array<{ title: string; slug: string; excerpt?: string | null }>,
) {
  const origin = siteOrigin();
  const items = articles
    .map(
      (a) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eee">
            <a href="${origin}/noticia/${a.slug}" style="color:#111;font-weight:700;text-decoration:none">${a.title}</a>
            ${a.excerpt ? `<p style="margin:6px 0 0;color:#555;font-size:14px">${a.excerpt}</p>` : ""}
          </td>
        </tr>`,
    )
    .join("");
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#C8102E;font-weight:700">Cartel Deportivo</p>
      <h1 style="font-size:24px;line-height:1.1">Titulares de hoy</h1>
      <table width="100%" cellpadding="0" cellspacing="0">${items}</table>
      <p style="font-size:12px;color:#666;margin-top:24px"><a href="${origin}">Portada</a></p>
    </div>
  `;
}
