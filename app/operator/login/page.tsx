import { redirect } from "next/navigation";
import { isOperator } from "@/lib/operator-session";
import { SignInForm } from "./sign-in-form";

export default async function OperatorLoginPage() {
  if (await isOperator()) redirect("/operator");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold">운영자 로그인</h1>
      <SignInForm />
    </div>
  );
}
