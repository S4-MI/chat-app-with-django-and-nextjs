import { Conversation, UserMinimal } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
    conversation?: Conversation;
    onlineUsers?: UserMinimal[];
};

export const ChatHeader = ({ conversation, onlineUsers = [] }: Props) => {
    if (!conversation) {
        return <div className="flex items-center h-14 px-4 border-b">Select a conversation</div>;
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name && name.length > 0 ? name.substring(0, 2).toUpperCase() : "?";
    };

    // Check if user is online
    const isUserOnline = (user: UserMinimal) => {
        return onlineUsers.some((u) => u.id === user.id);
    };

    // Get conversation name
    const getConversationName = () => {
        if (conversation.is_group) {
            return conversation.name;
        }

        // For direct messages, show the other user's name (first member in the list)
        // In a real app with proper user data, we would filter out the current user
        return conversation.members[0]?.user.name || conversation.name;
    };

    return (
        <div className="flex items-center justify-between h-14 px-4 border-b">
            <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>
                        {conversation.is_group
                            ? getInitials(conversation.name)
                            : getInitials(conversation.members[0]?.user.name || "")}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h2 className="font-semibold">{getConversationName()}</h2>
                    <div className="flex items-center text-xs text-muted-foreground">
                        {conversation.members.length} {conversation.is_group ? "members" : "participants"}
                        {conversation.is_group && (
                            <span className="ml-2">
                                {conversation.members.filter((member) => isUserOnline(member.user)).length} online
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex -space-x-2">
                {conversation.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="relative">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <>
                                    <Avatar className="h-8 w-8 border-2 border-background">
                                        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                    </Avatar>
                                    {isUserOnline(member.user) && (
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                    )}
                                </>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{member.user.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}

                {conversation.members.length > 3 && (
                    <Badge variant="secondary" className="ml-2">
                        +{conversation.members.length - 3}
                    </Badge>
                )}
            </div>
        </div>
    );
};
