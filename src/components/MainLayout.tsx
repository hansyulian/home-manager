import { Container, Group, Text } from "@mantine/core";
import { PropsWithChildren } from "react";
import classes from "./MainLayout.module.css";

export function MainLayout(props: PropsWithChildren) {
  return (
    <>
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <Group gap={5} visibleFrom="xs">
            <Text>Hans Smart Home</Text>
          </Group>
        </Container>
      </header>
      {props.children}
    </>
  );
}
