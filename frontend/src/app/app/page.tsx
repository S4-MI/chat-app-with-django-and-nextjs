import { ConversationList } from "@/components/chat/ConversationList";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MessageCircle } from "lucide-react";

type Props = {
    searchParams: {
        id?: string;
    };
};

export default function AppPage({ searchParams }: Props) {
    return (
        <div className="h-screen w-full bg-background p-10">
            <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg">
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r">
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b bg-muted/40">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Conversations
                            </h2>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <ConversationList />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75}>
                    <ChatContainer conversationId={searchParams.id} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
