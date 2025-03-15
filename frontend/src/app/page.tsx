"use client";

import { useChat } from "@/context/ChatContext";
import UsernameForm from "@/components/UsernameForm";
import ChatInterface from "@/components/ChatInterface";
import { Toaster } from "@/components/ui/sonner";

export default function Home() {
    const { username } = useChat();

    return (
        <main>
            <Toaster />
            {!username ? <UsernameForm /> : <ChatInterface />}
        </main>
    );
}
