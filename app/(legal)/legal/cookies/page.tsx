import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Cookie Information — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string, locale: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString(locale, {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function CookiesPage() {
    const [settings, locale] = await Promise.all([getOrCreateLegalSettings(), getLocale()]);
    const lastUpdated = fmt(settings.documents.cookies.lastUpdated, locale);

    if (locale === "de") return <CookiesDe lastUpdated={lastUpdated} />;
    if (locale === "fr") return <CookiesFr lastUpdated={lastUpdated} />;
    return <CookiesEn lastUpdated={lastUpdated} />;
}

// ─── English ────────────────────────────────────────────────────────────────

function CookiesEn({ lastUpdated }: { lastUpdated: string }) {
    const cookies = [
        { name: "authjs.session-token", purpose: "Keeps you logged in by storing your session token.", duration: "Session (max 30 days)", type: "Strictly necessary" },
        { name: "authjs.csrf-token", purpose: "Prevents cross-site request forgery attacks.", duration: "Session", type: "Strictly necessary" },
        { name: "authjs.callback-url", purpose: "Returns you to the correct page after login.", duration: "Session", type: "Strictly necessary" },
        { name: "NEXT_LOCALE", purpose: "Remembers your language preference (en / de / fr).", duration: "1 year", type: "Functional" },
        { name: "sc_consent", purpose: "Records that you have acknowledged the cookie notice.", duration: "1 year", type: "Functional" },
    ];
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    ePrivacy &amp; GDPR
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Cookie Information
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated}
                </p>
            </header>

            <section className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                <p>
                    SC Orga Manager uses{" "}
                    <strong style={{ color: "rgba(200,220,232,0.85)" }}>only strictly necessary and functional cookies</strong>.
                    No consent banner is required because we do not use analytics, advertising, or third-party tracking cookies.
                </p>
                <p className="mt-3">
                    This page provides the cookie information required by the ePrivacy Directive Art. 5(3) and GDPR Art. 13.
                </p>
            </section>

            <CookieTable headers={["Cookie", "Set by", "Purpose", "Duration", "Category"]} cookies={cookies} />

            <ThirdPartySection
                title="Third-Party Services"
                stripe="Payment processing is handled server-side. If you visit stripe.com during checkout, Stripe may set its own cookies governed by their"
                stripeLink="Cookie Policy"
                stripeNote=". We do not load any Stripe JavaScript on our own pages."
                discord="When you click &quot;Login with Discord&quot;, you are redirected to discord.com. Discord&apos;s own cookies apply on their site. We only receive the OAuth token after you approve access."
                fonts="Fonts are self-hosted at build time — no requests are made to Google servers at runtime."
                analytics="None. We do not use Google Analytics, Meta Pixel, Hotjar, or any other tracking service."
                stripeLabel="Stripe (payments):"
                discordLabel="Discord (authentication):"
                fontsLabel="Google Fonts:"
                analyticsLabel="Analytics &amp; tracking:"
            />

            <SectionBox title="Managing Cookies">
                <p>
                    You can delete or block cookies in your browser settings at any time. Blocking the
                    strictly necessary cookies listed above will prevent you from logging in to SC Orga Manager.
                </p>
            </SectionBox>

            <SectionBox title="Contact">
                <p>
                    Questions about our cookie usage? Email us at{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </SectionBox>
        </article>
    );
}

// ─── German ─────────────────────────────────────────────────────────────────

function CookiesDe({ lastUpdated }: { lastUpdated: string }) {
    const cookies = [
        { name: "authjs.session-token", purpose: "Hält dich eingeloggt, indem dein Sitzungstoken gespeichert wird.", duration: "Sitzung (max. 30 Tage)", type: "Technisch notwendig" },
        { name: "authjs.csrf-token", purpose: "Schützt vor Cross-Site-Request-Forgery-Angriffen.", duration: "Sitzung", type: "Technisch notwendig" },
        { name: "authjs.callback-url", purpose: "Leitet dich nach dem Login auf die richtige Seite zurück.", duration: "Sitzung", type: "Technisch notwendig" },
        { name: "NEXT_LOCALE", purpose: "Speichert deine Sprachpräferenz (en / de / fr).", duration: "1 Jahr", type: "Funktional" },
        { name: "sc_consent", purpose: "Bestätigt, dass du den Cookie-Hinweis zur Kenntnis genommen hast.", duration: "1 Jahr", type: "Funktional" },
    ];
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    ePrivacy &amp; DSGVO
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Cookie-Informationen
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Zuletzt aktualisiert: {lastUpdated}
                </p>
            </header>

            <section className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                <p>
                    SC Orga Manager verwendet{" "}
                    <strong style={{ color: "rgba(200,220,232,0.85)" }}>ausschließlich technisch notwendige und funktionale Cookies</strong>.
                    Ein Consent-Banner ist nicht erforderlich, da wir keine Analyse-, Werbe- oder Tracking-Cookies von Drittanbietern einsetzen.
                </p>
                <p className="mt-3">
                    Diese Seite enthält die Cookie-Informationen gemäß Art. 5 Abs. 3 ePrivacy-Richtlinie und Art. 13 DSGVO.
                </p>
            </section>

            <CookieTable headers={["Cookie", "Gesetzt von", "Zweck", "Dauer", "Kategorie"]} cookies={cookies} />

            <ThirdPartySection
                title="Drittanbieter-Dienste"
                stripe="Die Zahlungsabwicklung erfolgt serverseitig. Wenn du während des Checkouts stripe.com besuchst, kann Stripe eigene Cookies setzen, die seiner"
                stripeLink="Cookie-Richtlinie"
                stripeNote=" unterliegen. Wir laden kein Stripe-JavaScript auf unseren eigenen Seiten."
                discord="Wenn du auf &quot;Mit Discord anmelden&quot; klickst, wirst du zu discord.com weitergeleitet. Auf dieser Seite gelten die eigenen Cookies von Discord. Wir erhalten nur das OAuth-Token, nachdem du den Zugriff genehmigt hast."
                fonts="Schriften werden zum Build-Zeitpunkt selbst gehostet – zur Laufzeit werden keine Anfragen an Google-Server gesendet."
                analytics="Keine. Wir verwenden kein Google Analytics, Meta Pixel, Hotjar oder andere Tracking-Dienste."
                stripeLabel="Stripe (Zahlungen):"
                discordLabel="Discord (Authentifizierung):"
                fontsLabel="Google Fonts:"
                analyticsLabel="Analyse &amp; Tracking:"
            />

            <SectionBox title="Cookies verwalten">
                <p>
                    Du kannst Cookies jederzeit in deinen Browsereinstellungen löschen oder blockieren.
                    Das Blockieren der oben aufgeführten technisch notwendigen Cookies verhindert die
                    Anmeldung bei SC Orga Manager.
                </p>
            </SectionBox>

            <SectionBox title="Kontakt">
                <p>
                    Fragen zu unserer Cookie-Nutzung? Kontaktiere uns unter{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </SectionBox>
        </article>
    );
}

// ─── French ─────────────────────────────────────────────────────────────────

function CookiesFr({ lastUpdated }: { lastUpdated: string }) {
    const cookies = [
        { name: "authjs.session-token", purpose: "Maintient votre connexion en stockant votre jeton de session.", duration: "Session (max 30 jours)", type: "Strictement nécessaire" },
        { name: "authjs.csrf-token", purpose: "Protège contre les attaques de falsification de requêtes intersites.", duration: "Session", type: "Strictement nécessaire" },
        { name: "authjs.callback-url", purpose: "Vous redirige vers la bonne page après connexion.", duration: "Session", type: "Strictement nécessaire" },
        { name: "NEXT_LOCALE", purpose: "Mémorise votre préférence de langue (en / de / fr).", duration: "1 an", type: "Fonctionnel" },
        { name: "sc_consent", purpose: "Enregistre que vous avez pris connaissance de l'avis sur les cookies.", duration: "1 an", type: "Fonctionnel" },
    ];
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    ePrivacy &amp; RGPD
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Informations sur les cookies
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Dernière mise à jour : {lastUpdated}
                </p>
            </header>

            <section className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                <p>
                    SC Orga Manager utilise{" "}
                    <strong style={{ color: "rgba(200,220,232,0.85)" }}>uniquement des cookies strictement nécessaires et fonctionnels</strong>.
                    Aucune bannière de consentement n&apos;est requise car nous n&apos;utilisons pas de cookies d&apos;analyse, de publicité ou de suivi tiers.
                </p>
                <p className="mt-3">
                    Cette page fournit les informations sur les cookies requises par l&apos;art. 5(3) de la directive ePrivacy et l&apos;art. 13 du RGPD.
                </p>
            </section>

            <CookieTable headers={["Cookie", "Défini par", "Objectif", "Durée", "Catégorie"]} cookies={cookies} />

            <ThirdPartySection
                title="Services tiers"
                stripe="Le traitement des paiements s'effectue côté serveur. Si vous visitez stripe.com lors du paiement, Stripe peut définir ses propres cookies régis par sa"
                stripeLink="Politique en matière de cookies"
                stripeNote=". Nous ne chargeons aucun JavaScript Stripe sur nos propres pages."
                discord="Lorsque vous cliquez sur &quot;Se connecter avec Discord&quot;, vous êtes redirigé vers discord.com. Les cookies propres à Discord s&apos;appliquent sur leur site. Nous ne recevons que le jeton OAuth après votre approbation."
                fonts="Les polices sont auto-hébergées au moment de la compilation — aucune requête n'est envoyée aux serveurs Google lors de l'exécution."
                analytics="Aucun. Nous n'utilisons pas Google Analytics, Meta Pixel, Hotjar ou tout autre service de suivi."
                stripeLabel="Stripe (paiements) :"
                discordLabel="Discord (authentification) :"
                fontsLabel="Google Fonts :"
                analyticsLabel="Analyse &amp; suivi :"
            />

            <SectionBox title="Gérer les cookies">
                <p>
                    Vous pouvez supprimer ou bloquer les cookies dans les paramètres de votre navigateur
                    à tout moment. Le blocage des cookies strictement nécessaires mentionnés ci-dessus
                    vous empêchera de vous connecter à SC Orga Manager.
                </p>
            </SectionBox>

            <SectionBox title="Contact">
                <p>
                    Des questions sur notre utilisation des cookies ? Écrivez-nous à{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </SectionBox>
        </article>
    );
}

// ─── Shared components ───────────────────────────────────────────────────────

function CookieTable({ headers, cookies }: {
    headers: string[];
    cookies: { name: string; purpose: string; duration: string; type: string }[];
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {headers[0]}s
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.15)" }}>
                            {headers.map((h) => (
                                <th key={h} className="pb-2 pr-4 text-left text-[10px] uppercase tracking-[0.2em]"
                                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cookies.map((c) => (
                            <tr key={c.name} style={{ borderBottom: "1px solid rgba(79,195,220,0.07)" }}>
                                <td className="py-3 pr-4 font-mono" style={{ color: "rgba(200,220,232,0.85)" }}>{c.name}</td>
                                <td className="py-3 pr-4" style={{ color: "rgba(200,220,232,0.65)" }}>SC Orga Manager</td>
                                <td className="py-3 pr-4" style={{ color: "rgba(200,220,232,0.65)" }}>{c.purpose}</td>
                                <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "rgba(200,220,232,0.65)" }}>{c.duration}</td>
                                <td className="py-3">
                                    <span className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                                        style={{
                                            background: c.type.toLowerCase().includes("necessar") || c.type.toLowerCase().includes("notwendig")
                                                ? "rgba(79,195,220,0.08)" : "rgba(200,220,232,0.06)",
                                            color: c.type.toLowerCase().includes("necessar") || c.type.toLowerCase().includes("notwendig")
                                                ? "rgba(79,195,220,0.7)" : "rgba(200,220,232,0.45)",
                                            fontFamily: "var(--font-mono)",
                                        }}>
                                        {c.type}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function ThirdPartySection({ title, stripe, stripeLink, stripeNote, discord, fonts, analytics, stripeLabel, discordLabel, fontsLabel, analyticsLabel }: {
    title: string; stripe: string; stripeLink: string; stripeNote: string;
    discord: string; fonts: string; analytics: string;
    stripeLabel: string; discordLabel: string; fontsLabel: string; analyticsLabel: string;
}) {
    return (
        <section className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {title}
            </h2>
            <div className="hud-panel p-5 text-sm leading-relaxed space-y-3"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                <p>
                    <strong style={{ color: "rgba(200,220,232,0.85)" }} dangerouslySetInnerHTML={{ __html: stripeLabel }} />{" "}
                    {stripe}{" "}
                    <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>{stripeLink}</a>
                    {stripeNote}
                </p>
                <p>
                    <strong style={{ color: "rgba(200,220,232,0.85)" }} dangerouslySetInnerHTML={{ __html: discordLabel }} />{" "}
                    <span dangerouslySetInnerHTML={{ __html: discord }} />
                </p>
                <p>
                    <strong style={{ color: "rgba(200,220,232,0.85)" }}>{fontsLabel}</strong>{" "}
                    {fonts}
                </p>
                <p>
                    <strong style={{ color: "rgba(200,220,232,0.85)" }} dangerouslySetInnerHTML={{ __html: analyticsLabel }} />{" "}
                    {analytics}
                </p>
            </div>
        </section>
    );
}

function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {title}
            </h2>
            <div className="hud-panel p-5 text-sm" style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}
