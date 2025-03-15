"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { toast } from "sonner";

interface ChatContextType {
    messages: ChatMessage[];
    username: string;
    setUsername: (username: string) => void;
    sendMessage: (message: string) => void;
    isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [username, setUsername] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/chat/messages/");
                const data = await response.json();
                setMessages(data.messages.reverse());
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        if (!username) return;

        // Connect to WebSocket
        const connectWebSocket = () => {
            // This line creates a new WebSocket connection to the specified URL, allowing real-time communication with the chat server.
            // The "ws://" prefix indicates that this is a WebSocket connection, which is different from a standard HTTP connection.
            const ws = new WebSocket("ws://localhost:8000/ws/chat/");

            ws.onopen = () => {
                setIsConnected(true);
                toast.success("Connected to chat");
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: data.id,
                        username: data.username,
                        message: data.message,
                        timestamp: data.timestamp,
                    },
                ]);
            };

            ws.onclose = () => {
                setIsConnected(false);
                toast.error("Disconnected from chat");
                // Try to reconnect after a delay
                setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                toast.error("WebSocket connection error");
            };

            socketRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [username]);

    const sendMessage = (message: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            toast.error("Not connected to chat");
            return;
        }

        socketRef.current.send(
            JSON.stringify({
                message,
                username,
            })
        );
    };

    return (
        <ChatContext.Provider value={{ messages, username, setUsername, sendMessage, isConnected }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
