"use client";

import { Table, Text } from "@mantine/core";
import { PropsWithChildren } from "react";

export type TableValueLabelProps = PropsWithChildren<{
  label?: string;
}>;

export function TableValueLabel(props: TableValueLabelProps) {
  const { children, label } = props;
  return (
    <Table.Tr>
      <Table.Td>
        <Text>{label}</Text>
      </Table.Td>
      <Table.Td>{children}</Table.Td>
    </Table.Tr>
  );
}

const TableValueLabelContainer = (props: PropsWithChildren) => {
  return (
    <Table>
      <Table.Tbody>{props.children}</Table.Tbody>
    </Table>
  );
};
TableValueLabel.Container = TableValueLabelContainer;
