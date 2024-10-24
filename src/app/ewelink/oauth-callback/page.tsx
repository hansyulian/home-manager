import { redirect } from "next/navigation";
import { defaultEwelinkInstance } from "~/lib/ewelink";

interface Props {
  searchParams: Promise<{
    code?: string;
    region?: string;
  }>;
}

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const { code, region } = searchParams;

  if (!code) {
    throw new Error("Missing code");
  }
  if (!region) {
    throw new Error("Missing region");
  }

  await defaultEwelinkInstance.handleOauthCallback(code, region);

  return redirect("/");
}
