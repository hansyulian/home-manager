// src/app/ewelink/oauth-callback/page.tsx

import { redirect } from "next/navigation";
import { Text } from "@mantine/core";

interface Props {
  searchParams: {
    code?: string; // Define the structure of your search parameters
  };
}

// The page will receive searchParams as props for SSR
export default async function Page({ searchParams }: Props) {
  const code = searchParams.code; // Get the code directly from the props

  // Optional: Handle cases where code is not present
  if (!code) {
    redirect("/error"); // Redirect if the code is missing
  }

  return <Text>Code: {code}</Text>; // Render the code
}
