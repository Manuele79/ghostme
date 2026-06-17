import { NextResponse } from "next/server";
import { houseWorkerFlow } from "@/lib/ghostme/home/houseWorkerFlow";


export async function GET(req: Request) {
  const result = await houseWorkerFlow(req);

  if (result.status === 200) {
    return NextResponse.json(result.body);
  }

  return NextResponse.json(result.body, { status: result.status });
}
