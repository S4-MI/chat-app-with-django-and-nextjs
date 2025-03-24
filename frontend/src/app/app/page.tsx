import { getUserProfile } from "@/action/auth-action";
import SignOutButton from "@/components/auth/SignOutButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function AppPage() {
    const { response, error } = await getUserProfile();

    if (error || !response) {
        redirect("/");
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome to the App</CardTitle>
                    <CardDescription>You are now logged in</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium">Name</h3>
                            <p>{response.name || "Not provided"}</p>
                        </div>
                        <div>
                            <h3 className="font-medium">Email</h3>
                            <p>{response.email || "Not provided"}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SignOutButton />
                </CardFooter>
            </Card>
        </div>
    );
}
