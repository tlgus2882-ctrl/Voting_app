"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseKstDateTime } from "@/lib/kst";
import { getDb } from "@/lib/neon-db";
import {
  endOperatorSession,
  isCorrectOperatorPassword,
  isOperator,
  startOperatorSession,
} from "@/lib/operator-session";
import {
  MAX_OPTION_LENGTH,
  MAX_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_OPTIONS,
} from "@/lib/poll-limits";
import { createPoll, deletePoll, type CreatePollError } from "@/lib/polls";

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

const createPollMessages: Record<CreatePollError, string> = {
  "question-empty": "질문을 입력해 주세요.",
  "question-too-long": `질문은 ${MAX_QUESTION_LENGTH}자 이하로 입력해 주세요.`,
  "too-few-options": `선택지는 ${MIN_OPTIONS}개 이상이어야 합니다.`,
  "too-many-options": `선택지는 ${MAX_OPTIONS}개 이하여야 합니다.`,
  "option-empty": "비어 있는 선택지가 있습니다.",
  "option-too-long": `선택지는 ${MAX_OPTION_LENGTH}자 이하로 입력해 주세요.`,
  "duplicate-options": "같은 선택지가 두 번 이상 있습니다.",
  "deadline-not-in-future": "마감 시간은 지금 이후로 정해 주세요.",
};

/** `postedCount` bumps on every successful post so the form can reset. */
export type CreatePollState = { error: string | null; postedCount: number };

export async function createPollAction(
  prev: CreatePollState,
  formData: FormData,
): Promise<CreatePollState> {
  if (!(await isOperator())) redirect("/operator/login");

  const question = String(formData.get("question") ?? "");
  const options = formData.getAll("option").map(String);
  const deadlineInput = String(formData.get("deadline") ?? "");
  const deadline = deadlineInput === "" ? null : parseKstDateTime(deadlineInput);
  if (deadlineInput !== "" && !deadline) {
    return { error: "마감 시간을 다시 입력해 주세요.", postedCount: prev.postedCount };
  }
  const result = await createPoll(getDb(), { question, options, deadline }, new Date());
  if (!result.ok) {
    return { error: createPollMessages[result.error], postedCount: prev.postedCount };
  }
  revalidatePath("/operator");
  return { error: null, postedCount: prev.postedCount + 1 };
}

export async function deletePollAction(formData: FormData): Promise<void> {
  if (!(await isOperator())) redirect("/operator/login");

  const pollId = Number(formData.get("pollId"));
  if (Number.isInteger(pollId)) await deletePoll(getDb(), pollId);
  revalidatePath("/operator");
}
