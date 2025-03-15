"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatInterface() {
    const { messages, username, sendMessage, isConnected } = useChat();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage("");
        }
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Format timestamp to a readable format
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-screen flex-col">
            <Card className="flex h-full flex-col rounded-none border-0">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle>Global Chat</CardTitle>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
                    {messages.map((msg, index) => (
                        <div
                            key={msg.id || index}
                            className={`flex items-start gap-3 ${msg.username === username ? "justify-end" : ""}`}
                        >
                            {msg.username !== username && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(msg.username)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`flex flex-col ${msg.username === username ? "items-end" : ""}`}>
                                <div className="flex items-center gap-2">
                                    {msg.username !== username && (
                                        <span className="text-sm font-medium">{msg.username}</span>
                                    )}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(msg.timestamp)}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>{new Date(msg.timestamp).toLocaleString()}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-lg max-w-md ${
                                        msg.username === username ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                            {msg.username === username && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(msg.username)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={!isConnected}>
                            Send
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
