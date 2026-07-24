import { redirect } from "next/navigation";

/**
 * Digital customer registration is unified at /create-card (account + plan + payment).
 * This route is retained as a permanent redirect to the single canonical entry point.
 */
export default function Page(): never {
  redirect("/register");
}
