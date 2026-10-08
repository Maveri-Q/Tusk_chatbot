import { POST as extractPost } from "@/app/api/memories/extract/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  return extractPost(req as any);
}
