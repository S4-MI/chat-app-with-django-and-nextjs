"use server";

import { api } from "@/lib/api";
import { Message } from "@/types/chat";

export const getConversationMessages = async (conversationId: number) => {
    try {
        const response = await api.get<Message[]>(`/api/chat/conversations/${conversationId}/messages/`);
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error(`Error fetching messages for conversation ${conversationId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error fetching messages",
        };
    }
};

export const sendMessage = async (
    conversationId: number,
    data: { content: string; message_type?: string; file_url?: string }
) => {
    try {
        const response = await api.post<Message>(`/api/chat/conversations/${conversationId}/messages/`, data);
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error(`Error sending message to conversation ${conversationId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error sending message",
        };
    }
};

export const updateMessage = async (messageId: number, content: string) => {
    try {
        const response = await api.put<Message>(`/api/chat/messages/${messageId}/`, { content });
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error(`Error updating message ${messageId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error updating message",
        };
    }
};

export const deleteMessage = async (messageId: number) => {
    try {
        await api.delete(`/api/chat/messages/${messageId}/`);
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error(`Error deleting message ${messageId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error deleting message",
        };
    }
};

export const addReaction = async (messageId: number, reaction: string) => {
    try {
        await api.post(`/api/chat/messages/${messageId}/reactions/`, { reaction });
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error(`Error adding reaction to message ${messageId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error adding reaction",
        };
    }
};

export const removeReaction = async (messageId: number, reaction: string) => {
    try {
        await api.delete(`/api/chat/messages/${messageId}/reactions/?reaction=${encodeURIComponent(reaction)}`);
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error(`Error removing reaction from message ${messageId}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error removing reaction",
        };
    }
};
