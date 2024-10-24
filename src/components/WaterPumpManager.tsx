"use client";

import { Button, Loader, Stack, Table, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import Link from "next/link";
import { Icon } from "~/components/Icon";
import { TableValueLabel } from "~/components/TableValueLabel";
import { useGetStatus } from "~/hooks/useGetStatus";
import { WaterTorrentData } from "~/types/responses";

export function WaterPumpManager() {
  const { data, isLoading } = useGetStatus();
  if (isLoading || !data) {
    return <Loader />;
  }
  const { isAuthenticated, waterTorrent } = data;

  return (
    <Stack>
      <WaterTorrentSummary data={waterTorrent} />
      <Title order={4}>Controls</Title>
      {isAuthenticated ? <AuthenticatedState /> : <UnauthenticatedState />}
    </Stack>
  );
}

function AuthenticatedState() {
  return <Text>Ewelink Authenticated</Text>;
}

function UnauthenticatedState() {
  return (
    <Button component={Link} href="/ewelink/oauth-login">
      Authentication Required
    </Button>
  );
}

function WaterTorrentSummary(props: { data: WaterTorrentData }) {
  const { data } = props;
  const { detected, lastTimestamp, value } = data;
  return (
    <TableValueLabel.Container>
      <TableValueLabel label="Sensor Detected">
        {detected ? <Icon name="success" /> : <Icon name="failed" />}
      </TableValueLabel>
      <TableValueLabel label="Sensor Value">{value.toFixed(2)}</TableValueLabel>
      <TableValueLabel label="Last Timestamp">
        {dayjs(lastTimestamp).format("YYYY-MM-DD HH:mm:ss")}
      </TableValueLabel>
    </TableValueLabel.Container>
  );
}
