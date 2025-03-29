"use server";

import { api } from "@/lib/api";
import { User } from "@/types/chat";

export const getUsers = async () => {
    try {
        const users = await api.get<User[]>("/api/users/");
        return {
            success: true,
            data: users,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            error: (error as Error).message || "Error fetching users",
        };
    }
};

export const getCurrentUser = async () => {
    try {
        const user = await api.get<User>("/api/accounts/me/");
        return {
            success: true,
            data: user,
        };
    } catch (error) {
        console.error("Error fetching current user:", error);
        return {
            success: false,
            error: (error as Error).message || "Error fetching current user",
        };
    }
};
