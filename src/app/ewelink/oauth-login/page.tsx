import { redirect } from "next/navigation";
import { defaultEwelinkInstance } from "~/lib/ewelink";

export default function Page() {
  const ewelinkLoginUrl = defaultEwelinkInstance.getLoginUrl();
  redirect(ewelinkLoginUrl);
}
