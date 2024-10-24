"use client";

import { Button, Loader, Stack, Switch, Title } from "@mantine/core";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "~/components/Icon";
import { ValueLabel } from "~/components/ValueLabel";
import { useChangeWaterPumpState } from "~/hooks/useChangeWaterPumpState";
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
  const [isOn, setIsOn] = useState(false);
  const [isManaged, setIsManaged] = useState(false);
  const { data } = useGetStatus();
  const changeWaterPumpState = useChangeWaterPumpState();

  const toggleManaged = async () => {
    setIsManaged(!isManaged);
    await changeWaterPumpState({
      isManaged: !isManaged,
    });
  };

  const toggleState = async () => {
    setIsOn(!isOn);
    await changeWaterPumpState({
      isOn: !isOn,
    });
  };

  useEffect(() => {
    if (!data) {
      return;
    }
    setIsManaged(data.waterPump.isManaged);
    setIsOn(data.waterPump.isOn || false);
  }, [data]);

  return (
    <ValueLabel.Container>
      <ValueLabel label="State">
        <Switch checked={isOn} onChange={toggleState} />
      </ValueLabel>
      <ValueLabel label="Managed">
        <Switch checked={isManaged} onChange={toggleManaged} />
      </ValueLabel>
    </ValueLabel.Container>
  );
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
    <ValueLabel.Container>
      <ValueLabel label="Sensor Detected">
        {detected ? (
          <Icon name="success" color="green" />
        ) : (
          <Icon name="failed" color="red" />
        )}
      </ValueLabel>
      <ValueLabel label="Sensor Value">{value.toFixed(2)}</ValueLabel>
      <ValueLabel label="Last Timestamp">
        {dayjs(lastTimestamp).format("YYYY-MM-DD HH:mm:ss")}
      </ValueLabel>
    </ValueLabel.Container>
  );
}
