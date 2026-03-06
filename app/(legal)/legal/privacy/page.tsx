import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Privacy Policy — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string, locale: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString(locale, {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function PrivacyPolicyPage() {
    const [settings, locale] = await Promise.all([getOrCreateLegalSettings(), getLocale()]);
    const lastUpdated = fmt(settings.documents.privacy.lastUpdated, locale);

    if (locale === "de") return <PrivacyDe lastUpdated={lastUpdated} />;
    if (locale === "fr") return <PrivacyFr lastUpdated={lastUpdated} />;
    return <PrivacyEn lastUpdated={lastUpdated} />;
}

// ─── English ────────────────────────────────────────────────────────────────

function PrivacyEn({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    GDPR Compliance
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Privacy Policy
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated} · Applies to scoim.io
                </p>
            </header>

            <Section label="1. Controller">
                <p>The controller responsible for data processing on this website is:</p>
                <p className="mt-2">
                    Marcell Dechant<br />
                    Löttringhauser Str. 4, 44225 Dortmund, Germany<br />
                    Email:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Data Protection Officer">
                <p>
                    No Data Protection Officer has been appointed. For a small SaaS operated by a private
                    individual, appointment is typically not required under GDPR Art. 37.
                    For privacy-related enquiries, contact:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="3. What data we collect and why">
                <SubSection label="3.1 Account &amp; Authentication">
                    <p>When you log in via Discord OAuth, we receive and store: Discord user ID, display name, email address, and avatar URL.</p>
                    <DataRow basis="GDPR Art. 6(1)(b) — performance of contract" retention="Until account deletion or 2 years of inactivity" />
                </SubSection>
                <SubSection label="3.2 Organization Data">
                    <p>We store organization names, member lists (Discord user IDs + roles), inventory items, transaction records, cargo logs, and audit logs that you and your organization create.</p>
                    <DataRow basis="GDPR Art. 6(1)(b) — performance of contract" retention="Until the organization is deleted or 2 years after last activity" />
                </SubSection>
                <SubSection label="3.3 Payment Data (PRO subscribers)">
                    <p>We use Stripe for payment processing. We store: Stripe customer ID, subscription ID, subscription status, and billing period. We do NOT store full card numbers — these are handled entirely by Stripe.</p>
                    <DataRow basis="GDPR Art. 6(1)(b) — performance of contract; Art. 6(1)(c) — legal obligation (invoicing)" retention="10 years (legal requirement for financial records)" />
                </SubSection>
                <SubSection label="3.4 Email Communications">
                    <p>We send transactional emails (welcome email, invoices) via Resend. We do NOT send marketing emails or newsletters without separate explicit consent.</p>
                    <DataRow basis="GDPR Art. 6(1)(b) — performance of contract" retention="Email logs held by Resend per their retention policy" />
                </SubSection>
                <SubSection label="3.5 Server Logs">
                    <p>Our hosting provider (Render.com) may log IP addresses and request metadata for security and stability purposes.</p>
                    <DataRow basis="GDPR Art. 6(1)(f) — legitimate interest (security and stability)" retention="Approx. 30 days — managed by Render.com" />
                </SubSection>
                <SubSection label="3.6 Cookies and Local Storage">
                    <p>
                        We use only strictly necessary and functional cookies. No analytics, advertising, or
                        tracking cookies are used. See our{" "}
                        <a href="/legal/cookies" style={{ color: "var(--accent-primary)" }}>Cookie Information page</a>{" "}
                        for details.
                    </p>
                </SubSection>
            </Section>

            <Section label="4. Data Processors (Third Parties)">
                <p className="mb-3">We share personal data with the following processors strictly as necessary to provide the service:</p>
                <ProcessorTable headers={["Processor", "Purpose", "Location", "DPA"]} rows={[
                    { p: "Stripe Inc.", purpose: "Payment processing", loc: "USA (SCC)", dpa: "stripe.com/legal/dpa" },
                    { p: "Resend Inc.", purpose: "Transactional email", loc: "USA (SCC)", dpa: "resend.com/legal/dpa" },
                    { p: "Render.com", purpose: "App hosting + MongoDB", loc: "USA (SCC)", dpa: "render.com/privacy" },
                    { p: "Discord Inc.", purpose: "Authentication (OAuth)", loc: "USA (SCC)", dpa: "discord.com/privacy" },
                    { p: "Google LLC", purpose: "Sheets sync (optional, admin opt-in)", loc: "USA (SCC)", dpa: "workspace.google.com/intl/en/terms/dpa" },
                ]} />
            </Section>

            <Section label="5. International Transfers">
                <p>
                    Several processors are based in the United States. Transfers are protected by Standard
                    Contractual Clauses (SCCs) pursuant to GDPR Art. 46(2)(c) and/or the EU–US Data Privacy
                    Framework where applicable.
                </p>
            </Section>

            <Section label="6. Your Rights (GDPR Chapter III)">
                <p className="mb-3">You have the following rights regarding your personal data:</p>
                <ul className="space-y-2">
                    {[
                        ["Art. 15 — Access", "Request a copy of your personal data."],
                        ["Art. 16 — Rectification", "Correct inaccurate data we hold about you."],
                        ["Art. 17 — Erasure", "Delete your account and associated personal data."],
                        ["Art. 18 — Restriction", "Limit how we process your data in certain circumstances."],
                        ["Art. 20 — Portability", "Receive your data in machine-readable format."],
                        ["Art. 21 — Object", "Object to processing based on legitimate interest."],
                    ].map(([right, desc]) => (
                        <li key={right} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>▸</span>
                            <span><strong style={{ color: "rgba(200,220,232,0.85)" }}>{right}:</strong> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4">
                    To exercise these rights: go to{" "}
                    <a href="/terminal/settings" style={{ color: "var(--accent-primary)" }}>Settings → Data &amp; Privacy</a>
                    , or email{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                    . We respond within 30 days.
                </p>
            </Section>

            <Section label="7. Right to Lodge a Complaint">
                <p>
                    You may lodge a complaint with your national data protection authority. In Germany:
                    Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW),{" "}
                    <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)" }}>
                        www.ldi.nrw.de
                    </a>
                    . If you reside in another EU country, contact your local supervisory authority.
                </p>
            </Section>

            <Section label="8. Changes to This Policy">
                <p>
                    We will update the &quot;Last updated&quot; date at the top of this page when we make changes.
                    For material changes, we will notify you via in-app dialog requiring your acknowledgement.
                </p>
            </Section>
        </article>
    );
}

// ─── German ─────────────────────────────────────────────────────────────────

function PrivacyDe({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    DSGVO-Konformität
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Datenschutzerklärung
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Zuletzt aktualisiert: {lastUpdated} · Gilt für scoim.io
                </p>
            </header>

            <Section label="1. Verantwortlicher">
                <p>Verantwortlicher für die Datenverarbeitung auf dieser Website ist:</p>
                <p className="mt-2">
                    Marcell Dechant<br />
                    Löttringhauser Str. 4, 44225 Dortmund, Deutschland<br />
                    E-Mail:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Datenschutzbeauftragter">
                <p>
                    Es wurde kein Datenschutzbeauftragter benannt. Für einen kleinen SaaS-Dienst,
                    der von einer Privatperson betrieben wird, ist die Benennung gemäß Art. 37 DSGVO
                    in der Regel nicht erforderlich. Für datenschutzbezogene Anfragen wende dich an:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="3. Welche Daten wir erheben und warum">
                <SubSection label="3.1 Konto &amp; Authentifizierung">
                    <p>Wenn du dich über Discord OAuth anmeldest, empfangen und speichern wir: Discord-Nutzer-ID, Anzeigename, E-Mail-Adresse und Avatar-URL.</p>
                    <DataRow basis="Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung" retention="Bis zur Kontolöschung oder nach 2 Jahren Inaktivität" />
                </SubSection>
                <SubSection label="3.2 Organisationsdaten">
                    <p>Wir speichern Organisationsnamen, Mitgliederlisten (Discord-Nutzer-IDs und Rollen), Inventarartikel, Transaktionsdatensätze, Frachtprotokolle und Prüfprotokolle, die du und deine Organisation erstellen.</p>
                    <DataRow basis="Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung" retention="Bis zur Löschung der Organisation oder 2 Jahre nach letzter Aktivität" />
                </SubSection>
                <SubSection label="3.3 Zahlungsdaten (PRO-Abonnenten)">
                    <p>Wir nutzen Stripe für die Zahlungsabwicklung. Wir speichern: Stripe-Kunden-ID, Abonnement-ID, Abonnementstatus und Abrechnungszeitraum. Wir speichern KEINE vollständigen Kartennummern – diese werden ausschließlich von Stripe verarbeitet.</p>
                    <DataRow basis="Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung; lit. c — rechtliche Verpflichtung (Rechnungslegung)" retention="10 Jahre (gesetzliche Aufbewahrungspflicht für Buchungsbelege)" />
                </SubSection>
                <SubSection label="3.4 E-Mail-Kommunikation">
                    <p>Wir versenden transaktionale E-Mails (Willkommens-E-Mail, Rechnungen) über Resend. Wir versenden KEINE Marketing-E-Mails oder Newsletter ohne gesonderte ausdrückliche Einwilligung.</p>
                    <DataRow basis="Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung" retention="E-Mail-Protokolle werden von Resend gemäß deren Aufbewahrungsrichtlinie gespeichert" />
                </SubSection>
                <SubSection label="3.5 Server-Protokolle">
                    <p>Unser Hosting-Anbieter (Render.com) kann IP-Adressen und Anfragemetadaten für Sicherheits- und Stabilitätszwecke protokollieren.</p>
                    <DataRow basis="Art. 6 Abs. 1 lit. f DSGVO — berechtigtes Interesse (Sicherheit und Stabilität)" retention="Ca. 30 Tage — verwaltet von Render.com" />
                </SubSection>
                <SubSection label="3.6 Cookies und lokaler Speicher">
                    <p>
                        Wir verwenden ausschließlich technisch notwendige und funktionale Cookies. Es werden keine Analyse-, Werbe- oder Tracking-Cookies eingesetzt. Weitere Details findest du auf unserer{" "}
                        <a href="/legal/cookies" style={{ color: "var(--accent-primary)" }}>Cookie-Informationsseite</a>.
                    </p>
                </SubSection>
            </Section>

            <Section label="4. Auftragsverarbeiter (Drittanbieter)">
                <p className="mb-3">Wir geben personenbezogene Daten ausschließlich im für die Bereitstellung des Dienstes erforderlichen Umfang an folgende Auftragsverarbeiter weiter:</p>
                <ProcessorTable headers={["Auftragsverarbeiter", "Zweck", "Standort", "AVV"]} rows={[
                    { p: "Stripe Inc.", purpose: "Zahlungsabwicklung", loc: "USA (SCCs)", dpa: "stripe.com/legal/dpa" },
                    { p: "Resend Inc.", purpose: "Transaktionale E-Mails", loc: "USA (SCCs)", dpa: "resend.com/legal/dpa" },
                    { p: "Render.com", purpose: "App-Hosting + MongoDB", loc: "USA (SCCs)", dpa: "render.com/privacy" },
                    { p: "Discord Inc.", purpose: "Authentifizierung (OAuth)", loc: "USA (SCCs)", dpa: "discord.com/privacy" },
                    { p: "Google LLC", purpose: "Sheets-Sync (optional, Admin-Opt-in)", loc: "USA (SCCs)", dpa: "workspace.google.com/intl/de/terms/dpa" },
                ]} />
            </Section>

            <Section label="5. Internationale Datenübermittlungen">
                <p>
                    Mehrere Auftragsverarbeiter haben ihren Sitz in den Vereinigten Staaten. Die Übermittlungen
                    sind durch Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2 lit. c DSGVO und/oder
                    den EU-US-Datenschutzrahmen (Data Privacy Framework) geschützt, soweit anwendbar.
                </p>
            </Section>

            <Section label="6. Deine Rechte (Kapitel III DSGVO)">
                <p className="mb-3">Du hast folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
                <ul className="space-y-2">
                    {[
                        ["Art. 15 — Auskunft", "Kopie deiner personenbezogenen Daten anfordern."],
                        ["Art. 16 — Berichtigung", "Unrichtige Daten, die wir über dich gespeichert haben, korrigieren."],
                        ["Art. 17 — Löschung", "Dein Konto und die damit verbundenen personenbezogenen Daten löschen."],
                        ["Art. 18 — Einschränkung", "Die Verarbeitung deiner Daten in bestimmten Fällen einschränken."],
                        ["Art. 20 — Datenübertragbarkeit", "Deine Daten in einem maschinenlesbaren Format erhalten."],
                        ["Art. 21 — Widerspruch", "Der Verarbeitung auf Basis berechtigter Interessen widersprechen."],
                    ].map(([right, desc]) => (
                        <li key={right} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>▸</span>
                            <span><strong style={{ color: "rgba(200,220,232,0.85)" }}>{right}:</strong> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4">
                    So machst du deine Rechte geltend: Gehe zu{" "}
                    <a href="/terminal/settings" style={{ color: "var(--accent-primary)" }}>Einstellungen → Daten &amp; Datenschutz</a>
                    , oder schreibe an{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                    . Wir antworten innerhalb von 30 Tagen.
                </p>
            </Section>

            <Section label="7. Beschwerderecht">
                <p>
                    Du hast das Recht, Beschwerde bei einer Aufsichtsbehörde einzulegen. Zuständig für
                    Nordrhein-Westfalen ist die Landesbeauftragte für Datenschutz und Informationsfreiheit
                    Nordrhein-Westfalen (LDI NRW),{" "}
                    <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)" }}>
                        www.ldi.nrw.de
                    </a>
                    . Wenn du in einem anderen EU-Land wohnst, wende dich an deine lokale Aufsichtsbehörde.
                </p>
            </Section>

            <Section label="8. Änderungen dieser Datenschutzerklärung">
                <p>
                    Wir aktualisieren das Datum &bdquo;Zuletzt aktualisiert&ldquo; oben auf dieser Seite, wenn wir Änderungen
                    vornehmen. Bei wesentlichen Änderungen werden wir dich per In-App-Dialog informieren,
                    der deine Bestätigung erfordert.
                </p>
            </Section>
        </article>
    );
}

// ─── French ─────────────────────────────────────────────────────────────────

function PrivacyFr({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Conformité RGPD
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Politique de confidentialité
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Dernière mise à jour : {lastUpdated} · Applicable à scoim.io
                </p>
            </header>

            <Section label="1. Responsable du traitement">
                <p>Le responsable du traitement des données sur ce site est :</p>
                <p className="mt-2">
                    Marcell Dechant<br />
                    Löttringhauser Str. 4, 44225 Dortmund, Allemagne<br />
                    E-mail :{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Délégué à la protection des données">
                <p>
                    Aucun délégué à la protection des données (DPO) n&apos;a été désigné. Pour un petit SaaS
                    exploité par un particulier, la désignation n&apos;est généralement pas requise au titre
                    de l&apos;art. 37 du RGPD. Pour toute question relative à la confidentialité, contactez :{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="3. Données collectées et finalités">
                <SubSection label="3.1 Compte &amp; Authentification">
                    <p>Lors de votre connexion via Discord OAuth, nous recevons et stockons : l&apos;identifiant Discord, le nom d&apos;affichage, l&apos;adresse e-mail et l&apos;URL de l&apos;avatar.</p>
                    <DataRow basis="Art. 6(1)(b) RGPD — exécution du contrat" retention="Jusqu'à la suppression du compte ou 2 ans d'inactivité" />
                </SubSection>
                <SubSection label="3.2 Données d'organisation">
                    <p>Nous stockons les noms d&apos;organisation, les listes de membres (identifiants Discord et rôles), les articles d&apos;inventaire, les transactions, les journaux de fret et les journaux d&apos;audit que vous et votre organisation créez.</p>
                    <DataRow basis="Art. 6(1)(b) RGPD — exécution du contrat" retention="Jusqu'à la suppression de l'organisation ou 2 ans après la dernière activité" />
                </SubSection>
                <SubSection label="3.3 Données de paiement (abonnés PRO)">
                    <p>Nous utilisons Stripe pour le traitement des paiements. Nous stockons : l&apos;identifiant client Stripe, l&apos;identifiant d&apos;abonnement, le statut et la période de facturation. Nous ne stockons PAS les numéros de carte complets — ceux-ci sont entièrement gérés par Stripe.</p>
                    <DataRow basis="Art. 6(1)(b) RGPD — exécution du contrat ; Art. 6(1)(c) — obligation légale (facturation)" retention="10 ans (obligation légale pour les documents comptables)" />
                </SubSection>
                <SubSection label="3.4 Communications par e-mail">
                    <p>Nous envoyons des e-mails transactionnels (e-mail de bienvenue, factures) via Resend. Nous n&apos;envoyons PAS d&apos;e-mails marketing ni de newsletters sans consentement explicite séparé.</p>
                    <DataRow basis="Art. 6(1)(b) RGPD — exécution du contrat" retention="Journaux d'e-mails conservés par Resend selon leur politique de rétention" />
                </SubSection>
                <SubSection label="3.5 Journaux serveur">
                    <p>Notre hébergeur (Render.com) peut enregistrer les adresses IP et les métadonnées de requêtes à des fins de sécurité et de stabilité.</p>
                    <DataRow basis="Art. 6(1)(f) RGPD — intérêt légitime (sécurité et stabilité)" retention="Environ 30 jours — géré par Render.com" />
                </SubSection>
                <SubSection label="3.6 Cookies et stockage local">
                    <p>
                        Nous utilisons uniquement des cookies strictement nécessaires et fonctionnels. Aucun cookie
                        analytique, publicitaire ou de suivi n&apos;est utilisé. Consultez notre{" "}
                        <a href="/legal/cookies" style={{ color: "var(--accent-primary)" }}>page d&apos;informations sur les cookies</a>{" "}
                        pour plus de détails.
                    </p>
                </SubSection>
            </Section>

            <Section label="4. Sous-traitants (tiers)">
                <p className="mb-3">Nous partageons des données personnelles avec les sous-traitants suivants, strictement dans la mesure nécessaire à la fourniture du service :</p>
                <ProcessorTable headers={["Sous-traitant", "Finalité", "Localisation", "DPA"]} rows={[
                    { p: "Stripe Inc.", purpose: "Traitement des paiements", loc: "USA (CCT)", dpa: "stripe.com/legal/dpa" },
                    { p: "Resend Inc.", purpose: "E-mails transactionnels", loc: "USA (CCT)", dpa: "resend.com/legal/dpa" },
                    { p: "Render.com", purpose: "Hébergement + MongoDB", loc: "USA (CCT)", dpa: "render.com/privacy" },
                    { p: "Discord Inc.", purpose: "Authentification (OAuth)", loc: "USA (CCT)", dpa: "discord.com/privacy" },
                    { p: "Google LLC", purpose: "Synchronisation Sheets (optionnel)", loc: "USA (CCT)", dpa: "workspace.google.com/intl/fr/terms/dpa" },
                ]} />
            </Section>

            <Section label="5. Transferts internationaux">
                <p>
                    Plusieurs sous-traitants sont basés aux États-Unis. Les transferts sont encadrés par des
                    clauses contractuelles types (CCT) conformément à l&apos;art. 46(2)(c) du RGPD et/ou le
                    cadre EU–USA de protection des données (Data Privacy Framework), selon le cas.
                </p>
            </Section>

            <Section label="6. Vos droits (Chapitre III du RGPD)">
                <p className="mb-3">Vous disposez des droits suivants concernant vos données personnelles :</p>
                <ul className="space-y-2">
                    {[
                        ["Art. 15 — Accès", "Demander une copie de vos données personnelles."],
                        ["Art. 16 — Rectification", "Corriger les données inexactes que nous détenons sur vous."],
                        ["Art. 17 — Effacement", "Supprimer votre compte et les données personnelles associées."],
                        ["Art. 18 — Limitation", "Limiter le traitement de vos données dans certaines circonstances."],
                        ["Art. 20 — Portabilité", "Recevoir vos données dans un format lisible par machine."],
                        ["Art. 21 — Opposition", "Vous opposer au traitement fondé sur l'intérêt légitime."],
                    ].map(([right, desc]) => (
                        <li key={right} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>▸</span>
                            <span><strong style={{ color: "rgba(200,220,232,0.85)" }}>{right} :</strong> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4">
                    Pour exercer ces droits : rendez-vous dans{" "}
                    <a href="/terminal/settings" style={{ color: "var(--accent-primary)" }}>Paramètres → Données &amp; Confidentialité</a>
                    , ou écrivez à{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                    . Nous répondons dans un délai de 30 jours.
                </p>
            </Section>

            <Section label="7. Droit de réclamation">
                <p>
                    Vous pouvez introduire une réclamation auprès de l&apos;autorité de protection des données
                    de votre pays. En Allemagne : Landesbeauftragte für Datenschutz und Informationsfreiheit
                    Nordrhein-Westfalen (LDI NRW),{" "}
                    <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)" }}>
                        www.ldi.nrw.de
                    </a>
                    . Si vous résidez dans un autre pays de l&apos;UE, contactez votre autorité de contrôle locale.
                </p>
            </Section>

            <Section label="8. Modifications de cette politique">
                <p>
                    Nous mettrons à jour la date « Dernière mise à jour » en haut de cette page lors de
                    toute modification. Pour les changements importants, nous vous en informerons via une
                    boîte de dialogue in-app nécessitant votre prise de connaissance.
                </p>
            </Section>
        </article>
    );
}

// ─── Shared components ───────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-display)" }}>
                {label}
            </h2>
            <div className="hud-panel p-5 text-sm leading-relaxed space-y-3"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2 pt-3 first:pt-0"
            style={{ borderTop: "1px solid rgba(79,195,220,0.07)" }}>
            <h3 className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {label}
            </h3>
            {children}
        </div>
    );
}

function DataRow({ basis, retention }: { basis: string; retention: string }) {
    return (
        <div className="mt-2 text-xs space-y-1"
            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
            <p><span style={{ color: "rgba(79,195,220,0.4)" }}>Legal basis:</span> {basis}</p>
            <p><span style={{ color: "rgba(79,195,220,0.4)" }}>Retention:</span> {retention}</p>
        </div>
    );
}

function ProcessorTable({ headers, rows }: {
    headers: string[];
    rows: { p: string; purpose: string; loc: string; dpa: string }[];
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.15)" }}>
                        {headers.map((h) => (
                            <th key={h} className="pb-2 pr-4 text-left text-[10px] uppercase tracking-[0.2em]"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody style={{ color: "rgba(200,220,232,0.65)" }}>
                    {rows.map((r) => (
                        <tr key={r.p} style={{ borderBottom: "1px solid rgba(79,195,220,0.07)" }}>
                            <td className="py-2 pr-4 font-medium" style={{ color: "rgba(200,220,232,0.85)" }}>{r.p}</td>
                            <td className="py-2 pr-4">{r.purpose}</td>
                            <td className="py-2 pr-4">{r.loc}</td>
                            <td className="py-2">{r.dpa}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
