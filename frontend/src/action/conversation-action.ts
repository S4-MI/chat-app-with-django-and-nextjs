"use server";

import { Conversation } from "@/types/chat";
import { api } from "@/lib/api";

export const getConversations = async () => {
    try {
        const response = await api.get<Conversation[]>(`/api/chat/conversations/`);

        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return {
            success: false,
            error: (error as Error).message || "Error fetching conversations",
        };
    }
};

export const getConversation = async (id: number) => {
    try {
        const response = await api.get<Conversation>(`/api/chat/conversations/${id}/`);
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error(`Error fetching conversation ${id}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error fetching conversation",
        };
    }
};

export const createConversation = async (data: { name?: string; is_group: boolean; members: number[] }) => {
    try {
        const response = await api.post<Conversation>(`/api/chat/conversations/create/`, data);

        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error("Error creating conversation:", error);
        return {
            success: false,
            error: (error as Error).message || "Error creating conversation",
        };
    }
};

export const updateConversation = async (id: number, name: string) => {
    try {
        const response = await api.put<Conversation>(`/api/chat/conversations/${id}/`, { name });
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error(`Error updating conversation ${id}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error updating conversation",
        };
    }
};

export const deleteConversation = async (id: number) => {
    try {
        await api.delete(`/api/chat/conversations/${id}/`);
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error(`Error deleting conversation ${id}:`, error);
        return {
            success: false,
            error: (error as Error).message || "Error deleting conversation",
        };
    }
};
