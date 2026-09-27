"use client";

import { useActionState, useState } from "react";
import {
  CHART_TYPE_LABELS,
  CHART_TYPES,
  DEFAULT_CHART_TYPE,
  type ChartType,
} from "@/lib/chart-types";
import {
  MAX_OPTION_LENGTH,
  MAX_OPTIONS,
  MAX_QUESTION_LENGTH,
  MIN_OPTIONS,
} from "@/lib/poll-limits";
import { createPollAction, type CreatePollState } from "./actions";

const initialState: CreatePollState = { error: null, postedCount: 0 };

type OptionField = { key: number; text: string };

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export function CreatePollForm() {
  const [state, formAction, pending] = useActionState(createPollAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold">새 투표 주제</h2>
      {/* Remounting clears the fields after each successful post. */}
      <PollFields key={state.postedCount} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        올리기
      </button>
    </form>
  );
}

function PollFields() {
  const [question, setQuestion] = useState("");
  const [deadline, setDeadline] = useState("");
  const [chartType, setChartType] = useState<ChartType>(DEFAULT_CHART_TYPE);
  const [nextKey, setNextKey] = useState(MIN_OPTIONS);
  const [options, setOptions] = useState<OptionField[]>(
    Array.from({ length: MIN_OPTIONS }, (_, key) => ({ key, text: "" })),
  );

  const updateOption = (key: number, text: string) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));
  const addOption = () => {
    setOptions((prev) => [...prev, { key: nextKey, text: "" }]);
    setNextKey((k) => k + 1);
  };
  const removeOption = (key: number) =>
    setOptions((prev) => prev.filter((o) => o.key !== key));

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="question" className="text-sm font-medium">
          질문
        </label>
        <input
          id="question"
          name="question"
          required
          maxLength={MAX_QUESTION_LENGTH}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={inputClass}
        />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          선택지 ({MIN_OPTIONS}~{MAX_OPTIONS}개)
        </legend>
        {options.map((option, i) => (
          <div key={option.key} className="flex gap-2">
            <input
              name="option"
              required
              maxLength={MAX_OPTION_LENGTH}
              aria-label={`선택지 ${i + 1}`}
              value={option.text}
              onChange={(e) => updateOption(option.key, e.target.value)}
              className={inputClass}
            />
            {options.length > MIN_OPTIONS && (
              <button
                type="button"
                onClick={() => removeOption(option.key)}
                aria-label={`선택지 ${i + 1} 삭제`}
                className="shrink-0 rounded-md px-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="self-start text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            + 선택지 추가
          </button>
        )}
      </fieldset>
      <div className="flex flex-col gap-2">
        <label htmlFor="deadline" className="text-sm font-medium">
          마감 시간 <span className="font-normal text-zinc-500">(선택, 한국 시간)</span>
        </label>
        <input
          id="deadline"
          name="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-zinc-500">비워 두면 삭제할 때까지 계속 투표를 받습니다.</p>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">결과 그래프</legend>
        <div className="flex flex-wrap gap-4">
          {CHART_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="chartType"
                value={type}
                checked={chartType === type}
                onChange={() => setChartType(type)}
              />
              {CHART_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
