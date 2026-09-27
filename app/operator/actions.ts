"use server";

import { redirect } from "next/navigation";
import {
  endOperatorSession,
  isCorrectOperatorPassword,
  startOperatorSession,
} from "@/lib/operator-session";

export type SignInState = { error: string | null };

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const password = String(formData.get("password") ?? "");
  if (!isCorrectOperatorPassword(password)) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }
  await startOperatorSession();
  redirect("/operator");
}

export async function signOut(): Promise<void> {
  await endOperatorSession();
  redirect("/operator/login");
}
