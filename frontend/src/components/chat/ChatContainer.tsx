import { getConversationMessages } from "@/action/message-action";
import { MessageCircle } from "lucide-react";
import { ChatSection } from "./ChatSection";

type Props = {
    conversationId?: string;
};

export const ChatContainer = async ({ conversationId }: Props) => {
    if (!conversationId) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-muted/40">
                    <h2 className="text-lg font-semibold">Select a conversation or start a new one</h2>
                </div>
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No active conversation</p>
                        <p className="text-sm">Select a conversation from the sidebar or create a new one</p>
                    </div>
                </div>
            </div>
        );
    }

    const response = await getConversationMessages(Number(conversationId));

    if (!response.success || !response.data) {
        return <div>Error: {response.error}</div>;
    }

    const messages = response.data;

    return <ChatSection key={conversationId} messages={messages} conversationId={Number(conversationId)} />;
};
