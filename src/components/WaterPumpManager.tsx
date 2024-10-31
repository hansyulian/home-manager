"use client";

import {
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Switch,
  Table,
  Title,
  Text,
} from "@mantine/core";
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
  const { data, mutate } = useGetStatus();
  const changeWaterPumpState = useChangeWaterPumpState();

  const toggleManaged = async () => {
    setIsManaged(!isManaged);
    await changeWaterPumpState({
      isManaged: !isManaged,
    });
    mutate();
  };

  const toggleState = async () => {
    setIsOn(!isOn);
    await changeWaterPumpState({
      isOn: !isOn,
    });
    mutate();
  };

  useEffect(() => {
    if (!data) {
      return;
    }
    setIsManaged(data.waterPump.isManaged);
    setIsOn(data.waterPump.isOn || false);
  }, [data]);

  return (
    <Stack>
      <ValueLabel.Container>
        <ValueLabel label="State">
          <Switch checked={isOn} onChange={toggleState} />
        </ValueLabel>
        <ValueLabel label="Managed">
          <Switch checked={isManaged} onChange={toggleManaged} />
        </ValueLabel>
      </ValueLabel.Container>
      <Table.ScrollContainer minWidth="100%">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="200">Time</Table.Th>
              <Table.Th>Sensor Level</Table.Th>
              <Table.Th w="80">Trigger</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.waterPump.history.map((record, index) => (
              <Table.Tr key={`history-${index}`}>
                <Table.Td>
                  {dayjs(record.time).format("YYYY-MM-DD HH:mm:ss")}
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Box>
                      {record.sensorValue
                        ? Math.round(record.sensorValue)
                        : null}
                    </Box>
                    <Box h="20" flex={1} bd="1px solid black">
                      <Box
                        h="100%"
                        w={calculatePercentage(record.sensorValue)}
                        bg="blue"
                        ta="center"
                      >
                        <Text c="white" size="sm">
                          {calculatePercentage(record.sensorValue)}
                        </Text>
                      </Box>
                    </Box>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {record.trigger ? (
                    <Icon name="success" color="green" />
                  ) : (
                    <Icon name="failed" />
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
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

function calculatePercentage(value: number | undefined) {
  if (value === undefined) {
    return 0;
  }
  if (value > 125) {
    return 0;
  }
  if (value < 25) {
    return "100%";
  }
  return `${Math.round(125 - value)}%`;
}
