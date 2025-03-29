"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { FileText, ImageIcon, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
    markTyping: (isTyping: boolean) => void;
    sendMessage: (message: string) => Promise<void>;
    isConnected: boolean;
};

export function MessageInput({ markTyping, sendMessage, isConnected }: Props) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle typing indicator
    useEffect(() => {
        const handler = setTimeout(() => {
            markTyping(message.length > 0);
        }, 1000);

        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [message]);

    // Auto-focus textarea when conversation changes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    // Handle message submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;
        if (!isConnected) return;

        await sendMessage(message);
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit} className="border-t bg-background p-4 sticky bottom-0 z-10">
            <div className="flex items-end gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="resize-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    disabled={!isConnected}
                />

                <Button type="submit" className="flex-shrink-0" disabled={!message.trim() || !isConnected}>
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </form>
    );
}
