export interface Conversation {
    id: number;
    title: string;
    icon: string | null;
    is_group: boolean;
    created_at: string;
    updated_at: string;
    members: UserMinimal[];
}

export interface UserMinimal {
    id: number;
    name: string;
    username: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

export type MessageType = "user" | "system";

export interface Message {
    id: number;
    content: string;
    created_at: string;
    sender: UserMinimal | null;
    is_own_message: boolean;
    type: MessageType;
}

type JoinConversation = {
    type: "join";
    message: string;
};

type TypingStatus = {
    type: "typing_status";
    user: UserMinimal;
    is_typing: boolean;
};

type NewMessage = {
    type: "new_message";
    message: Message;
};

type ErrorStatus = {
    type: "error";
    message: string;
};

export type WebSocketMessage = JoinConversation | NewMessage | TypingStatus | ErrorStatus;
