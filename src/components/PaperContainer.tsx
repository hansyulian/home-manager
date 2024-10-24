import { Paper, Stack, Title } from "@mantine/core";
import { PropsWithChildren } from "react";

export type PaperContainerProps = PropsWithChildren & {
  title: string;
};

export function PaperContainer(props: PaperContainerProps) {
  const { title, children } = props;

  return (
    <Paper shadow="md" p="md">
      <Stack>
        <Title order={2}>{title}</Title>
        {children}
      </Stack>
    </Paper>
  );
}
