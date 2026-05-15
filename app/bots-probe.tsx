import React from "react";
import * as MessengerRealtimeProbeModule from "../src/modules/messenger/testing/MessengerRealtimeProbeScreen";

type ProbeScreenProps = {
  scope: "bots";
};

const MessengerRealtimeProbeScreen =
  (
    MessengerRealtimeProbeModule as {
      default?: React.ComponentType<ProbeScreenProps>;
      MessengerRealtimeProbeScreen?: React.ComponentType<ProbeScreenProps>;
    }
  ).default ??
  (
    MessengerRealtimeProbeModule as {
      MessengerRealtimeProbeScreen?: React.ComponentType<ProbeScreenProps>;
    }
  ).MessengerRealtimeProbeScreen;

export default function BotsProbeRoute() {
  if (!MessengerRealtimeProbeScreen) return null;
  return <MessengerRealtimeProbeScreen scope="bots" />;
}