/**
 * Shared shapes for server-action results.
 *
 * These live outside the `"use server"` modules on purpose: Next.js only
 * allows async functions to be exported from a server-action file, so the
 * idle constants would break the build if they lived next to the actions.
 */

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string>;
}

export const IDLE: ActionState = { status: "idle", message: "" };

export interface LoginState {
  status: "idle" | "error";
  message: string;
}

export const LOGIN_IDLE: LoginState = { status: "idle", message: "" };
