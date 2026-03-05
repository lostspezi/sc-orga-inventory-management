import type { OrganizationDocument } from "@/lib/types/organization";
import { isProOrg } from "./is-pro";

export class ProRequiredError extends Error {
    constructor() {
        super("PRO_REQUIRED");
        this.name = "ProRequiredError";
    }
}

export function requirePro(org: OrganizationDocument): void {
    if (!isProOrg(org)) {
        throw new ProRequiredError();
    }
}
