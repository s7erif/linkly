import { redirect } from "next/navigation";

export default function LoginPlaceholder(): never {
  redirect("/admin/login");
}
