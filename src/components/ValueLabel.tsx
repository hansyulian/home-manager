"use client";

import { Table, TableProps, Text } from "@mantine/core";
import { PropsWithChildren } from "react";

export type ValueLabelProps = PropsWithChildren<{
  label?: string;
  width?: number;
}>;

export function ValueLabel(props: ValueLabelProps) {
  const { children, label, width = "75%" } = props;
  return (
    <Table.Tr>
      <Table.Td>
        <Text>{label}</Text>
      </Table.Td>
      <Table.Td width={width}>{children}</Table.Td>
    </Table.Tr>
  );
}

const ValueLabelContainer = (props: PropsWithChildren & TableProps) => {
  const { children, ...rest } = props;
  return (
    <Table striped {...rest}>
      <Table.Tbody>{children}</Table.Tbody>
    </Table>
  );
};
ValueLabel.Container = ValueLabelContainer;
