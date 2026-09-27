import { redirect } from "next/navigation";
import { isOperator } from "@/lib/operator-session";
import { signOut } from "./actions";

export default async function OperatorPage() {
  if (!(await isOperator())) redirect("/operator/login");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">투표 주제 관리</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}
