"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { MessageInput } from "@/components/chat/MessageInput";
import { Conversation, Message, User, UserMinimal, WebSocketMessage } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
    messages: Message[];
    conversationId: number;
};

export function ChatSection(props: Props) {
    const [conversation, setConversation] = useState<Conversation | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>(props.messages);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<UserMinimal[]>([]);

    const conversationSocketRef = useRef<WebSocket | null>(null);
    const mounted = useRef(false); // TODO: rethink this

    useEffect(() => {
        const connectToWebSocket = async () => {
            if (!mounted.current) {
                await connectConversationWebSocket(props.conversationId);
            }
        };

        connectToWebSocket();

        return () => {
            mounted.current = true;
            // Close and cleanup the previous WebSocket connection
            if (conversationSocketRef.current) {
                conversationSocketRef.current.close();
                conversationSocketRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.conversationId]);

    const connectConversationWebSocket = async (conversationId: number) => {
        toast.info("Connecting to conversation WebSocket");

        try {
            // Get auth token
            const token = await getAuthToken();
            if (!token) {
                toast.error("Authentication token not found");
                return;
            }

            const ws = new WebSocket(
                `${process.env.NEXT_PUBLIC_API_URL}/ws/conversations/${conversationId}/?token=${token}`
            );

            ws.onopen = () => {
                toast.success(`Connected to conversation WebSocket`);
            };

            ws.onclose = () => {
                setIsConnected(false);
                toast.error("Disconnected from conversation WebSocket");

                // Try to reconnect after a delay
                setTimeout(() => {
                    if (props.conversationId === conversationId) {
                        connectConversationWebSocket(conversationId);
                    }
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                toast.error("Connection error. Trying to reconnect...");
            };

            ws.onmessage = (event) => {
                const data: WebSocketMessage = JSON.parse(event.data);

                switch (data.type) {
                    case "join":
                        setIsConnected(true);
                        toast.success(data.message);
                        break;

                    case "new_message":
                        setMessages((prevMessages) => [...prevMessages, data.message]);
                        break;

                    case "typing_status":
                        if (data.is_typing) {
                            if (typingUsers.find((user) => user.id === data.user.id)) {
                                return;
                            }

                            setTypingUsers((prevTypingUsers) => [...prevTypingUsers, data.user]);
                        } else {
                            setTypingUsers((prevTypingUsers) =>
                                prevTypingUsers.filter((user) => user.id !== data.user.id)
                            );
                        }

                        break;

                    case "error":
                        toast.error(`Error Message: ${data.message}`);
                        break;

                    default:
                        console.error("Unknown message type:", data);

                        // toast.error(`Unknown message type: ${data.type}`);
                        break;
                }
            };

            conversationSocketRef.current = ws;
        } catch (error) {
            console.error("Error connecting to WebSocket:", error);
            toast.error("Failed to connect to chat server");
        }
    };

    // Function to get the authentication token
    const getAuthToken = async (): Promise<string | null> => {
        try {
            const response = await fetch("/api/auth/token");
            if (!response.ok) {
                throw new Error("Failed to get authentication token");
            }
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error("Error fetching authentication token:", error);
            return null;
        }
    };

    const markTyping = (isTyping: boolean) => {
        if (!conversationSocketRef.current) {
            toast.error("Not connected to conversation");
            return;
        }

        try {
            conversationSocketRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
        } catch (error) {
            console.error("Error sending typing status:", error);
        }
    };

    const sendMessage = async (message: string) => {
        if (!conversationSocketRef.current) {
            toast.error("Not connected to conversation");
            return;
        }

        try {
            conversationSocketRef.current.send(
                JSON.stringify({
                    type: "message",
                    content: message,
                })
            );
            toast.success("Message sent");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ChatHeader conversation={conversation} />
            <ChatMessages messages={messages} typingUsers={typingUsers} />
            <MessageInput markTyping={markTyping} sendMessage={sendMessage} isConnected={isConnected} />
        </div>
    );
}
