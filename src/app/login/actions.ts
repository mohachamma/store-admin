"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, safeNext, setSession } from "@/lib/auth";

export type LoginState = { error?: "invalid" | "notAdmin" | "error"; email?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "invalid", email };

  let result;
  try {
    result = await api.login(email, password);
  } catch {
    return { error: "error", email };
  }
  if (result === "invalid") return { error: "invalid", email };
  if (result === "forbidden") return { error: "notAdmin", email };

  await setSession(result.accessToken, result.expiresIn);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
