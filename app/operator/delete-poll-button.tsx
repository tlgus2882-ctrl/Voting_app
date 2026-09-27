"use client";

import { deletePollAction } from "./actions";

export function DeletePollButton({ pollId, totalVotes }: { pollId: number; totalVotes: number }) {
  return (
    <form
      action={deletePollAction}
      onSubmit={(e) => {
        const ok = confirm(
          `이 투표 주제를 삭제할까요?\nVote ${totalVotes}개도 함께 삭제되며 되돌릴 수 없습니다.`,
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="pollId" value={pollId} />
      <button
        type="submit"
        className="shrink-0 rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
      >
        삭제
      </button>
    </form>
  );
}
