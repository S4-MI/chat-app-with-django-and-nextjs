import { getConversations } from "@/action/conversation-action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const ConversationList = async () => {
    const response = await getConversations();

    if (!response.success || !response.data) {
        return <div>Error: {response.error}</div>;
    }

    const conversations = response.data;

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    // Format the timestamp
    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            return "";
        }
    };

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            href={`/app?id=${conversation.id}`}
                            className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent"
                            )}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {getInitials(conversation.title || conversation.members[0].name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-medium truncate">
                                        {conversation.title || conversation.members[0].name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
