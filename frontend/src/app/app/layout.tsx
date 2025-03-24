export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Global Chat App</h1>
                </div>
            </header>
            <main className="container mx-auto py-6">{children}</main>
        </div>
    );
}
