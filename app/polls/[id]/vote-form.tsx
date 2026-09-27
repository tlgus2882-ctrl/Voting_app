"use client";

import { useActionState, useState } from "react";
import type { PollOption } from "@/lib/polls";
import { castVoteAction, type VoteState } from "./actions";

const initialState: VoteState = { error: null };

export function VoteForm({ pollId, options }: { pollId: number; options: PollOption[] }) {
  const [state, formAction, pending] = useActionState(castVoteAction, initialState);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="pollId" value={pollId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">선택지</legend>
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 has-[:checked]:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:has-[:checked]:border-zinc-100"
          >
            <input
              type="radio"
              name="optionId"
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
            />
            {option.text}
          </label>
        ))}
      </fieldset>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={selected === null || pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        투표하기
      </button>
    </form>
  );
}
