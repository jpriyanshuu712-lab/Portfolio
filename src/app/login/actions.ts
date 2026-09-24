"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { LoginState } from "@/lib/action-state";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    next: form.get("next"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Deliberately vague: don't confirm which accounts exist.
    return { status: "error", message: "Those details didn't work. Check the email and password and try again." };
  }

  // Signed in — but is this the owner? If not, end the session immediately
  // rather than leaving a useless authenticated cookie lying around.
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "That account isn't the site owner. Admin access is granted in SQL only.",
    };
  }

  const target = parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";
  revalidatePath("/admin", "layout");
  redirect(target);
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
