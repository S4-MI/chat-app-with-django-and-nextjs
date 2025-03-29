import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, UserMinimal } from "@/types/chat";
import { formatRelative } from "date-fns";
import { useEffect, useRef } from "react";

type Props = {
    messages: Message[];
    typingUsers: UserMinimal[];
};

export const ChatMessages = ({ messages, typingUsers }: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive or when someone starts typing
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typingUsers]);

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            return formatRelative(new Date(timestamp), new Date());
        } catch (e) {
            return "";
        }
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name && name.length > 0 ? name.substring(0, 2).toUpperCase() : "?";
    };

    // Group messages by day
    const groupMessagesByDay = () => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach((message) => {
            const date = new Date(message.created_at).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });

        return Object.entries(groups);
    };

    const groupedMessages = groupMessagesByDay();

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-medium">No messages yet</h3>
                            <p className="text-muted-foreground">Send a message to start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedMessages.map(([date, dayMessages]) => (
                            <div key={date} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            {new Date(date).toLocaleDateString(undefined, {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {dayMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_own_message ? "justify-end" : "justify-start"} gap-2 group`}
                                    >
                                        {!message.is_own_message && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                {message.sender && (
                                                    <AvatarFallback>
                                                        {getInitials(message.sender.username)}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                        )}

                                        <div
                                            className={`max-w-[75%] ${message.is_own_message ? "items-end" : "items-start"} flex flex-col`}
                                        >
                                            {!message.is_own_message && message.sender && (
                                                <div className="text-sm font-medium mb-1">
                                                    {message.sender.username}
                                                </div>
                                            )}

                                            <div className="relative group">
                                                <div
                                                    className={`p-3 rounded-lg ${
                                                        message.is_own_message
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted"
                                                    }`}
                                                >
                                                    {message.type === "system" ? (
                                                        <div className="italic text-muted-foreground">
                                                            {message.content}
                                                        </div>
                                                    ) : (
                                                        message.content
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatTimestamp(message.created_at)}
                                            </div>
                                        </div>

                                        {message.is_own_message && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                {message.sender && (
                                                    <AvatarFallback>
                                                        {getInitials(message.sender.username)}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 ml-2">
                                <div className="flex -space-x-2">
                                    {typingUsers.slice(0, 3).map((user) => (
                                        <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-muted-foreground">
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].username} is typing`
                                            : typingUsers.length === 2
                                              ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
                                              : typingUsers.length === 3
                                                ? `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers[2].username} are typing`
                                                : `${typingUsers.length} people are typing`}
                                    </span>
                                    <span className="typing-animation ml-1">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div ref={scrollRef} />
            </ScrollArea>
        </div>
    );
};
