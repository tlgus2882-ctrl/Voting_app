import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-zinc-600 dark:text-zinc-400">찾을 수 없는 투표 주제입니다.</p>
      <Link href="/" className="underline">
        목록으로
      </Link>
    </div>
  );
}
