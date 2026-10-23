import { adsenseClient } from "@/lib/googleConfig";

// ads.txt tells ad buyers that Google is allowed to sell ads on this site.
// AdSense warns about missing earnings until it is in place. The line format
// and the fixed f08c47fec0942fa0 ID come from Google's AdSense help page.
export function GET() {
  if (!adsenseClient) {
    return new Response("Not found\n", { status: 404 });
  }

  const publisherId = adsenseClient.replace(/^ca-/, "");
  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    },
  );
}
