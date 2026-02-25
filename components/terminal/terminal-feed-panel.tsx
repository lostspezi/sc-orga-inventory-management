import BottomLine from "@/components/terminal/bottom-line";
import PanelLabel from "@/components/terminal/panel-label";
import TopLine from "@/components/terminal/top-line";

export default function TerminalFeedPanel() {
    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4 sm:p-5"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <TopLine />
            <PanelLabel label="SYS.FEED" />

            <div
                className="rounded-lg border p-3"
                style={{
                    borderColor: "rgba(79,195,220,0.12)",
                    background: "rgba(7,18,28,0.35)",
                }}
            >
                <p
                    className="text-[10px] leading-5 tracking-[0.12em]"
                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    [BOOT] Terminal hub initialized
                    <br />
                    [AUTH] Clearance level verified
                    <br />
                    [ORG] Directory module ........ online
                    <br />
                    [ORG] Details shell ........... online
                    <br />
                    [MOD] Members UI .............. pending
                    <br />
                    [MOD] Inventory core .......... pending
                    <br />
                    [SYS] Standing by for next deployment<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                </p>
            </div>

            <BottomLine />
        </section>
    );
}
