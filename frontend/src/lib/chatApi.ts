import { Conversation, Message } from "@/types/chat";

// API base URL - adjust this based on your environment configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Get auth headers for API requests
function getHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    return headers;
}

// Helper function to handle API responses
async function handleResponse(response: Response) {
    if (!response.ok) {
        // Try to get error message from the response
        try {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API error: ${response.status}`);
        } catch (e) {
            throw new Error(`API error: ${response.status}`);
        }
    }
    return response.json();
}

// Chat API functions
export const chatApi = {
    // Conversations
    getConversations: async (): Promise<Conversation[]> => {
        const response = await fetch(`${API_BASE_URL}/conversations/`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getConversation: async (id: number): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    createConversation: async (data: {
        name?: string;
        is_group: boolean;
        members: number[];
    }): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/conversations/create/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    updateConversation: async (id: number, name: string): Promise<Conversation> => {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ name }),
        });
        return handleResponse(response);
    },

    deleteConversation: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/conversations/${id}/`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            return handleResponse(response);
        }
    },

    // Messages
    getMessages: async (conversationId: number): Promise<Message[]> => {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    sendMessage: async (
        conversationId: number,
        data: { content: string; message_type?: string; file_url?: string }
    ): Promise<Message> => {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    updateMessage: async (messageId: number, content: string): Promise<Message> => {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ content }),
        });
        return handleResponse(response);
    },

    deleteMessage: async (messageId: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/`, {
            method: "DELETE",
            headers: getHeaders(),
        });

        if (!response.ok) {
            return handleResponse(response);
        }
    },

    // Reactions
    addReaction: async (messageId: number, reaction: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/messages/${messageId}/reactions/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ reaction }),
        });
        return handleResponse(response);
    },

    removeReaction: async (messageId: number, reaction: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}/messages/${messageId}/reactions/?reaction=${encodeURIComponent(reaction)}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

        if (response.status !== 204 && !response.ok) {
            return handleResponse(response);
        }
    },
};

// WebSocket URLs
export const getConversationWebSocketUrl = (conversationId: number): string => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
    return `${host}/ws/conversations/${conversationId}/`;
};

export const getNotificationWebSocketUrl = (): string => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
    return `${host}/ws/notifications/`;
};
