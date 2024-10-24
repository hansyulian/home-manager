import { redirect } from "next/navigation";
import { ewelink } from "~/lib/ewelink";

export default function Page() {
  const ewelinkLoginUrl = ewelink.getLoginUrl();
  redirect(ewelinkLoginUrl);
}
