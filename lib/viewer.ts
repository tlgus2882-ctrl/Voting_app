import { isOperator } from "@/lib/operator-session";
import type { Viewer } from "@/lib/polls";
import { readVoterId } from "@/lib/voter";

/** Who is making this request, as the Poll module needs to know. */
export async function readViewer(): Promise<Viewer> {
  return { voterId: await readVoterId(), isOperator: await isOperator() };
}
