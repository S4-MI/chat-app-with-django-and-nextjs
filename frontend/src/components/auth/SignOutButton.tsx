"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { logoutAction } from "@/action/auth-action";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSignOut = () => {
        startTransition(async () => {
            const { success, error } = await logoutAction();

            if (success) {
                toast.success("Logged out successfully");
                router.push("/login");
            } else {
                toast.error(error);
            }
        });
    };

    return (
        <Button onClick={handleSignOut} variant="destructive" disabled={isPending}>
            {isPending ? "Signing out..." : "Sign out"}
        </Button>
    );
}
