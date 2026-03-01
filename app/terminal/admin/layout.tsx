import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { isSuperAdmin } from "@/lib/is-super-admin";
import AdminNav from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        notFound();
    }

    return (
        <div>
            <AdminNav />
            {children}
        </div>
    );
}
