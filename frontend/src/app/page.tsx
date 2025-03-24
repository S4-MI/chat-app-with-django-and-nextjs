import Link from "next/link";

// import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
    // const session = await auth();

    // if (session) {
    //     return redirect("/app");
    // }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Welcome</CardTitle>
                    <CardDescription className="text-center">A real-time global chat application</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-center">Chat with people from all over the world.</p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button asChild className="w-full sm:w-auto">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
