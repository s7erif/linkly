import { errorResponse } from "@/lib/api";

const RETIRED_MESSAGE =
  "The legacy card API has been retired. Use the authenticated Workspace card APIs.";

function retiredResponse() {
  return errorResponse(RETIRED_MESSAGE, 410, "GONE");
}

export function GET() {
  return retiredResponse();
}

export function POST() {
  return retiredResponse();
}

export function DELETE() {
  return retiredResponse();
}
