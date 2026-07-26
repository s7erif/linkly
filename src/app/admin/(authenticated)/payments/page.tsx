import { redirect } from "next/navigation";

export default function Payments() {
  redirect("/admin/orders");
}
