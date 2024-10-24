import { MantineProvider } from "@mantine/core";
import { PropsWithChildren } from "react";

export function Providers(props: PropsWithChildren) {
  return <MantineProvider>{props.children}</MantineProvider>;
}
