import { redirect } from "next/navigation";

export default function LegacyCreateCardPage(): never {
  redirect("/register");
}
