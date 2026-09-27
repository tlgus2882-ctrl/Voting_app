"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/neon-db";
import { castVote } from "@/lib/polls";
import { ensureVoterId } from "@/lib/voter";

export type VoteState = { error: string | null };

export async function castVoteAction(
  _prev: VoteState,
  formData: FormData,
): Promise<VoteState> {
  const pollId = Number(formData.get("pollId"));
  const optionId = Number(formData.get("optionId"));
  if (!Number.isInteger(pollId) || !Number.isInteger(optionId) || optionId <= 0) {
    return { error: "선택지를 하나 골라 주세요." };
  }

  const result = await castVote(getDb(), pollId, optionId, await ensureVoterId());
  switch (result) {
    case "ok":
    case "already-voted":
      redirect(`/polls/${pollId}`);
    case "poll-not-found":
      redirect("/?notice=poll-deleted");
    case "option-not-in-poll":
      return { error: "선택지를 다시 골라 주세요." };
  }
}
