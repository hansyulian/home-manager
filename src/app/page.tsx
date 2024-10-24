import { Container } from "@mantine/core";
import { PaperContainer } from "~/components/PaperContainer";
import { WaterPumpManager } from "~/components/WaterPumpManager";

export default function Home() {
  return (
    <Container pt="xl">
      <PaperContainer title="Water Pump">
        <WaterPumpManager />
      </PaperContainer>
    </Container>
  );
}
