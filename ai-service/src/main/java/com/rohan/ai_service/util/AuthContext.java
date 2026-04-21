package com.rohan.ai_service.util;

public class AuthContext {
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();

    public static void setToken(String token) {
        CONTEXT.set(token);
    }

    public static String getToken() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
