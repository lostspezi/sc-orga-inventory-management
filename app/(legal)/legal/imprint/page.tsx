import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Imprint — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string, locale: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString(locale, {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function ImprintPage() {
    const [settings, locale] = await Promise.all([getOrCreateLegalSettings(), getLocale()]);
    const lastUpdated = fmt(settings.documents.imprint.lastUpdated, locale);

    if (locale === "de") return <ImprintDe lastUpdated={lastUpdated} />;
    if (locale === "fr") return <ImprintFr lastUpdated={lastUpdated} />;
    return <ImprintEn lastUpdated={lastUpdated} />;
}

function ImprintEn({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Legal Notice
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Imprint
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated} · Information pursuant to § 5 TMG
                </p>
            </header>

            <LegalSection label="Operator">
                <LegalField label="Name">Marcell Dechant</LegalField>
                <LegalField label="Address">Löttringhauser Str. 4, 44225 Dortmund, Germany</LegalField>
            </LegalSection>

            <LegalSection label="Contact">
                <LegalField label="Email">
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </LegalField>
                <LegalField label="Discord">
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </LegalField>
            </LegalSection>

            <LegalSection label="Responsible for Content (§ 55 Abs. 2 RStV)">
                <p>Marcell Dechant, Löttringhauser Str. 4, 44225 Dortmund, Germany</p>
            </LegalSection>

            <LegalSection label="Disclaimer">
                <p>
                    SC Orga Manager is an independent third-party tool created for the Star Citizen community.
                    It is not affiliated with, endorsed by, or connected to Cloud Imperium Games Corporation
                    or Roberts Space Industries Corp. in any way.
                </p>
                <p className="mt-3">
                    Star Citizen® is a registered trademark of Cloud Imperium Games Corp. All Star Citizen
                    assets, names, and related marks are the property of their respective owners.
                </p>
            </LegalSection>

            <LegalSection label="Liability Notice">
                <p>
                    Despite careful review, we assume no liability for the accuracy, completeness, or
                    timeliness of external linked content. The operators of linked pages are solely
                    responsible for their content.
                </p>
            </LegalSection>
        </article>
    );
}

function ImprintDe({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Pflichtangaben
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Impressum
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Zuletzt aktualisiert: {lastUpdated} · Angaben gemäß § 5 TMG
                </p>
            </header>

            <LegalSection label="Betreiber">
                <LegalField label="Name">Marcell Dechant</LegalField>
                <LegalField label="Adresse">Löttringhauser Str. 4, 44225 Dortmund, Deutschland</LegalField>
            </LegalSection>

            <LegalSection label="Kontakt">
                <LegalField label="E-Mail">
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </LegalField>
                <LegalField label="Discord">
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </LegalField>
            </LegalSection>

            <LegalSection label="Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV)">
                <p>Marcell Dechant, Löttringhauser Str. 4, 44225 Dortmund, Deutschland</p>
            </LegalSection>

            <LegalSection label="Haftungsausschluss">
                <p>
                    SC Orga Manager ist ein unabhängiges Drittanbieter-Tool für die Star-Citizen-Community.
                    Es besteht keine Verbindung zu oder Unterstützung durch Cloud Imperium Games Corporation
                    oder Roberts Space Industries Corp.
                </p>
                <p className="mt-3">
                    Star Citizen® ist eine eingetragene Marke der Cloud Imperium Games Corp. Alle
                    Star-Citizen-Assets, Namen und verwandte Marken sind Eigentum der jeweiligen Inhaber.
                </p>
            </LegalSection>

            <LegalSection label="Haftungshinweis">
                <p>
                    Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die
                    Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich
                    deren Betreiber verantwortlich.
                </p>
            </LegalSection>
        </article>
    );
}

function ImprintFr({ lastUpdated }: { lastUpdated: string }) {
    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Informations légales
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Mentions légales
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Dernière mise à jour : {lastUpdated} · Conformément au § 5 TMG (droit allemand)
                </p>
            </header>

            <LegalSection label="Éditeur">
                <LegalField label="Nom">Marcell Dechant</LegalField>
                <LegalField label="Adresse">Löttringhauser Str. 4, 44225 Dortmund, Allemagne</LegalField>
            </LegalSection>

            <LegalSection label="Contact">
                <LegalField label="E-mail">
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </LegalField>
                <LegalField label="Discord">
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </LegalField>
            </LegalSection>

            <LegalSection label="Responsable éditorial (§ 55 al. 2 RStV)">
                <p>Marcell Dechant, Löttringhauser Str. 4, 44225 Dortmund, Allemagne</p>
            </LegalSection>

            <LegalSection label="Avertissement">
                <p>
                    SC Orga Manager est un outil indépendant créé pour la communauté Star Citizen.
                    Il n&apos;est ni affilié à, ni approuvé par Cloud Imperium Games Corporation
                    ou Roberts Space Industries Corp.
                </p>
                <p className="mt-3">
                    Star Citizen® est une marque déposée de Cloud Imperium Games Corp. Tous les
                    éléments, noms et marques liés à Star Citizen sont la propriété de leurs
                    détenteurs respectifs.
                </p>
            </LegalSection>

            <LegalSection label="Limitation de responsabilité">
                <p>
                    Malgré un examen attentif, nous déclinons toute responsabilité quant à l&apos;exactitude,
                    l&apos;exhaustivité ou l&apos;actualité des contenus des pages liées. Les exploitants de
                    ces pages sont seuls responsables de leurs contenus.
                </p>
            </LegalSection>
        </article>
    );
}

function LegalSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {label}
            </h2>
            <div className="hud-panel space-y-2 p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}

function LegalField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <p>
            <span className="mr-2 text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                {label}:
            </span>
            {children}
        </p>
    );
}
