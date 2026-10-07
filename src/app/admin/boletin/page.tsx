import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BoletinManager } from "@/app/admin/boletin/boletin-manager";

export default async function AdminNewsletterPage() {
  const [session, subscribers] = await Promise.all([
    auth(),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 400 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase">Boletín</h1>
        <p className="text-sm text-muted-foreground">
          {subscribers.length === 1 ? "1 suscriptor" : `${subscribers.length} suscriptores`}. El alta en portada ya
          guarda el correo; el envío usa Resend si hay clave.
        </p>
      </div>
      <BoletinManager
        canSend={session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR"}
        subscribers={subscribers.map((s) => ({
          id: s.id,
          email: s.email,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
