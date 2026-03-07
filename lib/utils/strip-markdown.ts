/**
 * Strips common markdown syntax to produce plain text suitable for excerpts / meta descriptions.
 * Simple regex-based — no library dependency needed for this use case.
 */
export function stripMarkdown(md: string): string {
    return md
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/~~(.+?)~~/g, "$1")
        .replace(/`{3}[\s\S]*?`{3}/g, "")
        .replace(/`(.+?)`/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/!\[.*?\]\(.+?\)/g, "")
        .replace(/^[-*_]{3,}$/gm, "")
        .replace(/^>\s*/gm, "")
        .replace(/\n+/g, " ")
        .trim();
}
