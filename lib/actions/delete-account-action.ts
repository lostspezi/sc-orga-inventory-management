"use server";

import { auth, signOut } from "@/auth";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import {
    deleteOrganizationAndAllData,
    removeMemberFromOrganizationInDb,
} from "@/lib/repositories/organization-repository";
import type { OrganizationDocument } from "@/lib/types/organization";

export async function deleteAccountAction(): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const db = await getDb();

    const orgs = await db
        .collection<OrganizationDocument>("organizations")
        .find({ "members.userId": userId })
        .toArray();

    for (const org of orgs) {
        const self = org.members.find((m) => m.userId === userId);
        const others = org.members.filter((m) => m.userId !== userId);

        if (self?.role === "owner") {
            if (others.length === 0) {
                // Sole owner — wipe the entire org
                await deleteOrganizationAndAllData(org._id);
                continue;
            }

            // Promote next senior member before removing self
            const nextOwner = others.find((m) => m.role === "admin") ?? others[0];
            await db.collection<OrganizationDocument>("organizations").updateOne(
                { _id: org._id, "members.userId": nextOwner.userId },
                { $set: { "members.$.role": "owner", updatedAt: new Date() } }
            );
        }

        await removeMemberFromOrganizationInDb(org._id.toString(), userId);
    }

    // Delete the user's auth records
    if (ObjectId.isValid(userId)) {
        const oid = new ObjectId(userId);
        await Promise.all([
            db.collection("users").deleteOne({ _id: oid }),
            db.collection("accounts").deleteMany({ userId: oid }),
            db.collection("sessions").deleteMany({ userId: oid }),
        ]);
    }

    await signOut({ redirectTo: "/login" });
}
