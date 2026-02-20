import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  return redirect("/dashboard/tasks");
}
