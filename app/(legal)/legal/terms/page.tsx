import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Terms & Conditions — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string, locale: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString(locale, {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function TermsPage() {
    const [settings, locale] = await Promise.all([getOrCreateLegalSettings(), getLocale()]);
    const lastUpdated = fmt(settings.documents.terms.lastUpdated, locale);

    if (locale === "de") return <TermsDe lastUpdated={lastUpdated} />;
    if (locale === "fr") return <TermsFr lastUpdated={lastUpdated} />;
    return <TermsEn lastUpdated={lastUpdated} />;
}

// ─── English ────────────────────────────────────────────────────────────────

function TermsEn({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Service Agreement
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Terms &amp; Conditions
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated} · Effective: {lastUpdated}
                </p>
            </header>

            <Section label="1. Operator">
                <p>
                    SC Orga Manager (&quot;the Service&quot;) is operated by Marcell Dechant,
                    Löttringhauser Str. 4, 44225 Dortmund, Germany (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
                    Contact:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Scope">
                <p>
                    These Terms govern your use of scoim.io, including the free and PRO subscription tiers.
                    By creating an account or using the Service, you agree to these Terms. If you do not agree,
                    you must not use the Service.
                </p>
            </Section>

            <Section label="3. Eligibility">
                <p>
                    You must be at least 16 years old to use the Service.
                    The Service is intended for players of Star Citizen® by Cloud Imperium Games.
                </p>
            </Section>

            <Section label="4. Account">
                <BulletList items={[
                    "Accounts are created via Discord OAuth. You are responsible for maintaining the security of your account.",
                    "You may not share accounts with or create accounts on behalf of others without their explicit consent.",
                    "You must provide accurate information and keep it up to date.",
                    "We may suspend or terminate accounts that violate these Terms, with or without notice depending on severity.",
                ]} />
            </Section>

            <Section label="5. Free Tier">
                <p>
                    The Free tier is provided as-is, without uptime guarantees or SLA commitments. We may
                    modify, limit, or discontinue Free tier features at any time with reasonable notice.
                </p>
            </Section>

            <Section label="6. PRO Subscription">
                <BulletList items={[
                    "Billed at €4.99/month via Stripe. Prices include applicable VAT.",
                    "Subscriptions auto-renew at the end of each billing period until cancelled.",
                    "Cancel anytime via Settings → Billing. Your PRO access remains active until the end of the current billing period.",
                    "No refunds for partial billing periods. EU consumers may have a 14-day right of withdrawal for digital services under Directive 2011/83/EU.",
                    "We may change pricing with at least 30 days' advance notice.",
                ]} />
            </Section>

            <Section label="7. Acceptable Use">
                <p className="mb-2">You may not use the Service to:</p>
                <BulletList items={[
                    "Violate any applicable law or regulation.",
                    "Harass, abuse, threaten, or harm other users.",
                    "Attempt to gain unauthorized access to any part of the Service or other users' data.",
                    "Scrape, reverse-engineer, or exploit the Service in ways not intended by its design.",
                    "Upload malicious content or interfere with the Service's operation.",
                ]} cross />
            </Section>

            <Section label="8. Intellectual Property">
                <p>
                    SC Orga Manager is not affiliated with Cloud Imperium Games Corporation or Roberts Space
                    Industries Corp. Star Citizen® and related marks are trademarks of Cloud Imperium Games Corp.
                    All Star Citizen assets belong to their respective owners.
                </p>
                <p className="mt-2">
                    The Service&apos;s own code, design, and content are the intellectual property of Marcell Dechant
                    and may not be reproduced or redistributed without permission.
                </p>
            </Section>

            <Section label="9. Liability Limitation">
                <p>To the maximum extent permitted by applicable law, the operator is not liable for:</p>
                <BulletList className="mt-2" items={[
                    "Loss of data or revenue arising from your use of the Service.",
                    "Service interruptions, outages, or bugs.",
                    "Content created or actions taken by other users.",
                    "Third-party service failures (Discord, Stripe, Render, etc.).",
                ]} />
            </Section>

            <Section label="10. Governing Law &amp; Disputes">
                <p>
                    These Terms are governed by the laws of Germany. EU consumers retain the right to sue
                    in their country of residence under applicable mandatory consumer protection provisions.
                    For unresolved disputes, the competent courts of Dortmund, Germany have jurisdiction.
                </p>
            </Section>

            <Section label="11. Changes to These Terms">
                <p>
                    We will notify users of material changes via in-app dialog at least 30 days in advance.
                    Continued use of the Service after the notice period constitutes acceptance of the revised Terms.
                    If you do not agree, you may delete your account before the changes take effect.
                </p>
            </Section>

            <Section label="12. Contact">
                <p>
                    For questions about these Terms, contact us at{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>{" "}
                    or via Discord:{" "}
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </p>
            </Section>
        </article>
    );
}

// ─── German ─────────────────────────────────────────────────────────────────

function TermsDe({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Nutzungsvertrag
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Allgemeine Geschäftsbedingungen
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Zuletzt aktualisiert: {lastUpdated} · Gültig ab: {lastUpdated}
                </p>
            </header>

            <Section label="1. Betreiber">
                <p>
                    SC Orga Manager (der &bdquo;Dienst&ldquo;) wird betrieben von Marcell Dechant,
                    Löttringhauser Str. 4, 44225 Dortmund, Deutschland (&bdquo;wir&ldquo;, &bdquo;uns&ldquo;, &bdquo;unser&ldquo;).
                    Kontakt:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Geltungsbereich">
                <p>
                    Diese AGB regeln deine Nutzung von scoim.io, einschließlich des kostenlosen und des
                    PRO-Abonnementtarifs. Mit der Erstellung eines Kontos oder der Nutzung des Dienstes
                    stimmst du diesen AGB zu. Wenn du nicht zustimmst, darfst du den Dienst nicht nutzen.
                </p>
            </Section>

            <Section label="3. Nutzungsvoraussetzungen">
                <p>
                    Du musst mindestens 16 Jahre alt sein, um den Dienst zu nutzen.
                    Der Dienst richtet sich an Spieler von Star Citizen® von Cloud Imperium Games.
                </p>
            </Section>

            <Section label="4. Konto">
                <BulletList items={[
                    "Konten werden über Discord OAuth erstellt. Du bist für die Sicherheit deines Kontos verantwortlich.",
                    "Du darfst Konten nicht mit anderen teilen oder Konten für andere ohne deren ausdrückliche Zustimmung erstellen.",
                    "Du musst korrekte Angaben machen und diese aktuell halten.",
                    "Wir können Konten, die gegen diese AGB verstoßen, mit oder ohne Vorankündigung sperren oder löschen.",
                ]} />
            </Section>

            <Section label="5. Kostenloser Tarif">
                <p>
                    Der kostenlose Tarif wird ohne Gewährleistung bereitgestellt, ohne Verfügbarkeitsgarantien
                    oder SLA-Verpflichtungen. Wir können Funktionen des kostenlosen Tarifs jederzeit mit
                    angemessener Vorankündigung ändern, einschränken oder einstellen.
                </p>
            </Section>

            <Section label="6. PRO-Abonnement">
                <BulletList items={[
                    "Monatliche Abrechnung zu 4,99 € über Stripe. Preise verstehen sich inklusive der anfallenden Mehrwertsteuer.",
                    "Abonnements verlängern sich automatisch am Ende jedes Abrechnungszeitraums bis zur Kündigung.",
                    "Jederzeit kündbar unter Einstellungen → Abrechnung. Der PRO-Zugang bleibt bis zum Ende des aktuellen Abrechnungszeitraums aktiv.",
                    "Keine Erstattung für angefangene Abrechnungszeiträume. EU-Verbraucher haben gemäß Richtlinie 2011/83/EU ein 14-tägiges Widerrufsrecht für digitale Dienstleistungen.",
                    "Preisänderungen werden mit mindestens 30 Tagen Vorlauf angekündigt.",
                ]} />
            </Section>

            <Section label="7. Zulässige Nutzung">
                <p className="mb-2">Du darfst den Dienst nicht nutzen, um:</p>
                <BulletList items={[
                    "Gegen geltendes Recht oder geltende Vorschriften zu verstoßen.",
                    "Andere Nutzer zu belästigen, zu missbrauchen, zu bedrohen oder zu schädigen.",
                    "Unbefugten Zugang zu Teilen des Dienstes oder zu Daten anderer Nutzer zu erlangen.",
                    "Den Dienst zu scrapen, zurückzuentwickeln oder auf eine vom Design nicht vorgesehene Weise auszunutzen.",
                    "Schadhafte Inhalte hochzuladen oder den Betrieb des Dienstes zu stören.",
                ]} cross />
            </Section>

            <Section label="8. Geistiges Eigentum">
                <p>
                    SC Orga Manager ist nicht mit Cloud Imperium Games Corporation oder Roberts Space
                    Industries Corp. verbunden. Star Citizen® und verwandte Marken sind Marken der
                    Cloud Imperium Games Corp. Alle Star-Citizen-Assets gehören den jeweiligen Inhabern.
                </p>
                <p className="mt-2">
                    Der eigene Code, das Design und die Inhalte des Dienstes sind geistiges Eigentum von
                    Marcell Dechant und dürfen ohne Erlaubnis nicht vervielfältigt oder weiterverbreitet werden.
                </p>
            </Section>

            <Section label="9. Haftungsbeschränkung">
                <p>Soweit gesetzlich zulässig, haftet der Betreiber nicht für:</p>
                <BulletList className="mt-2" items={[
                    "Datenverlust oder Umsatzeinbußen durch die Nutzung des Dienstes.",
                    "Dienstunterbrechungen, Ausfälle oder Fehler.",
                    "Inhalte, die von anderen Nutzern erstellt oder Handlungen, die von ihnen vorgenommen wurden.",
                    "Ausfälle von Drittanbieterdiensten (Discord, Stripe, Render usw.).",
                ]} />
            </Section>

            <Section label="10. Anwendbares Recht &amp; Streitigkeiten">
                <p>
                    Diese AGB unterliegen deutschem Recht. EU-Verbraucher behalten das Recht, in ihrem
                    Wohnsitzland gemäß den geltenden zwingenden Verbraucherschutzvorschriften zu klagen.
                    Für ungelöste Streitigkeiten sind die zuständigen Gerichte in Dortmund zuständig.
                </p>
            </Section>

            <Section label="11. Änderungen dieser AGB">
                <p>
                    Wir werden Nutzer über wesentliche Änderungen mindestens 30 Tage im Voraus per
                    In-App-Dialog informieren. Die weitere Nutzung des Dienstes nach Ablauf der
                    Ankündigungsfrist gilt als Zustimmung zu den geänderten AGB. Wenn du nicht
                    zustimmst, kannst du dein Konto vor Inkrafttreten der Änderungen löschen.
                </p>
            </Section>

            <Section label="12. Kontakt">
                <p>
                    Bei Fragen zu diesen AGB kontaktiere uns unter{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>{" "}
                    oder über Discord:{" "}
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </p>
            </Section>
        </article>
    );
}

// ─── French ─────────────────────────────────────────────────────────────────

function TermsFr({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Contrat de service
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Conditions Générales d&apos;Utilisation
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Dernière mise à jour : {lastUpdated} · En vigueur depuis : {lastUpdated}
                </p>
            </header>

            <Section label="1. Éditeur">
                <p>
                    SC Orga Manager (le « Service ») est exploité par Marcell Dechant,
                    Löttringhauser Str. 4, 44225 Dortmund, Allemagne (« nous », « notre »).
                    Contact :{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Champ d'application">
                <p>
                    Les présentes CGU régissent votre utilisation de scoim.io, y compris les offres
                    gratuites et PRO. En créant un compte ou en utilisant le Service, vous acceptez
                    ces CGU. Si vous n&apos;acceptez pas, vous ne devez pas utiliser le Service.
                </p>
            </Section>

            <Section label="3. Conditions d'utilisation">
                <p>
                    Vous devez avoir au moins 16 ans pour utiliser le Service.
                    Le Service est destiné aux joueurs de Star Citizen® de Cloud Imperium Games.
                </p>
            </Section>

            <Section label="4. Compte">
                <BulletList items={[
                    "Les comptes sont créés via Discord OAuth. Vous êtes responsable de la sécurité de votre compte.",
                    "Vous ne pouvez pas partager votre compte ni créer de compte au nom d'autres personnes sans leur consentement explicite.",
                    "Vous devez fournir des informations exactes et les maintenir à jour.",
                    "Nous pouvons suspendre ou résilier les comptes qui enfreignent ces CGU, avec ou sans préavis selon la gravité.",
                ]} />
            </Section>

            <Section label="5. Offre gratuite">
                <p>
                    L&apos;offre gratuite est fournie en l&apos;état, sans garantie de disponibilité ni engagement
                    de niveau de service. Nous pouvons modifier, limiter ou interrompre les fonctionnalités
                    gratuites à tout moment avec un préavis raisonnable.
                </p>
            </Section>

            <Section label="6. Abonnement PRO">
                <BulletList items={[
                    "Facturé 4,99 €/mois via Stripe. Les prix incluent la TVA applicable.",
                    "Les abonnements se renouvellent automatiquement à la fin de chaque période de facturation jusqu'à résiliation.",
                    "Résiliez à tout moment via Paramètres → Facturation. Votre accès PRO reste actif jusqu'à la fin de la période en cours.",
                    "Aucun remboursement pour les périodes partielles. Les consommateurs de l'UE peuvent bénéficier d'un droit de rétractation de 14 jours pour les services numériques conformément à la Directive 2011/83/UE.",
                    "Nous pouvons modifier les tarifs avec un préavis d'au moins 30 jours.",
                ]} />
            </Section>

            <Section label="7. Utilisation acceptable">
                <p className="mb-2">Vous ne pouvez pas utiliser le Service pour :</p>
                <BulletList items={[
                    "Enfreindre toute loi ou réglementation applicable.",
                    "Harceler, abuser, menacer ou nuire à d'autres utilisateurs.",
                    "Tenter d'obtenir un accès non autorisé à une partie du Service ou aux données d'autres utilisateurs.",
                    "Extraire des données, rétroconcevoir ou exploiter le Service de manière non prévue par sa conception.",
                    "Télécharger des contenus malveillants ou perturber le fonctionnement du Service.",
                ]} cross />
            </Section>

            <Section label="8. Propriété intellectuelle">
                <p>
                    SC Orga Manager n&apos;est pas affilié à Cloud Imperium Games Corporation ni à Roberts Space
                    Industries Corp. Star Citizen® et les marques associées sont des marques de Cloud Imperium
                    Games Corp. Tous les éléments de Star Citizen appartiennent à leurs propriétaires respectifs.
                </p>
                <p className="mt-2">
                    Le code, le design et le contenu propres au Service sont la propriété intellectuelle de
                    Marcell Dechant et ne peuvent être reproduits ou redistribués sans autorisation.
                </p>
            </Section>

            <Section label="9. Limitation de responsabilité">
                <p>Dans la mesure permise par la loi applicable, l&apos;opérateur n&apos;est pas responsable :</p>
                <BulletList className="mt-2" items={[
                    "De la perte de données ou de revenus résultant de votre utilisation du Service.",
                    "Des interruptions de service, pannes ou bugs.",
                    "Des contenus créés ou des actions effectuées par d'autres utilisateurs.",
                    "Des défaillances de services tiers (Discord, Stripe, Render, etc.).",
                ]} />
            </Section>

            <Section label="10. Droit applicable &amp; litiges">
                <p>
                    Les présentes CGU sont régies par le droit allemand. Les consommateurs de l&apos;UE conservent
                    le droit d&apos;agir dans leur pays de résidence au titre des dispositions impératives de
                    protection des consommateurs. Les tribunaux compétents de Dortmund, Allemagne, ont
                    juridiction pour tout litige non résolu.
                </p>
            </Section>

            <Section label="11. Modifications des CGU">
                <p>
                    Nous informerons les utilisateurs des modifications importantes via une boîte de dialogue
                    in-app au moins 30 jours à l&apos;avance. La poursuite de l&apos;utilisation du Service après
                    le délai de préavis vaut acceptation des CGU révisées. Si vous n&apos;acceptez pas, vous
                    pouvez supprimer votre compte avant l&apos;entrée en vigueur des modifications.
                </p>
            </Section>

            <Section label="12. Contact">
                <p>
                    Pour toute question concernant ces CGU, contactez-nous à{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>{" "}
                    ou via Discord :{" "}
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
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
            <div className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}

function BulletList({ items, cross, className }: { items: string[]; cross?: boolean; className?: string }) {
    return (
        <ul className={`space-y-2${className ? " " + className : ""}`}>
            {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                    <span style={{
                        color: cross ? "rgba(220,80,80,0.6)" : "var(--accent-primary)",
                        flexShrink: 0, fontFamily: "var(--font-mono)",
                    }}>
                        {cross ? "✕" : "▸"}
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
