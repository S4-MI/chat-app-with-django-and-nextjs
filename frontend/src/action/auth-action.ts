"use server";

import { cookies } from "next/headers";

import { LoginSchemaType, RegisterSchemaType } from "@/schema/auth-schema";
import { api } from "@/lib/api";

type User = {
    id: number;
    email: string;
    name: string;
};

export async function loginAction({ email, password }: LoginSchemaType) {
    try {
        const response = await api.post<{ token: string; user: User }>(`/api/accounts/login/`, { email, password });

        cookies().set("token", response.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return {
            success: true,
            data: response.user as User,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message || "Login request failed",
        };
    }
}

export async function registerAction({ email, password, name }: RegisterSchemaType) {
    try {
        const response = await api.post<{ token: string; user: User }>(`/api/accounts/register/`, {
            email,
            password,
            name,
        });

        cookies().set("token", response.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return {
            success: true,
            data: response.user as User,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message || "Registration request failed",
        };
    }
}

export async function getUserProfile() {
    try {
        const response = await api.get<User>(`/api/accounts/me/`);

        return { response };
    } catch (error) {
        return { response: null, error: (error as Error).message || "Something went wrong" };
    }
}

export async function logoutAction() {
    try {
        const token = cookies().get("token")?.value;

        if (token) {
            await api.post<undefined>(`/api/accounts/logout/`, {});
            cookies().delete("token");
            return { success: true };
        }

        return { success: false, error: "Already logged out" };
    } catch (error) {
        console.error("Logout action failed, error ->", error);

        return {
            success: false,
            error: (error as Error).message || "Logout failed",
        };
    }
}
