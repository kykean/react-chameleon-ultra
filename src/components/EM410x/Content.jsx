import React, { useState } from "react";
import { Buffer } from "buffer";
import { Button, ButtonGroup, Input } from "semantic-ui-react";
import { sendDataViaPort, usePort } from "../../hooks/device";
import { useWaitResponseMap } from "../../hooks/waitResponseMap";
import {
  DATA_CMD_SCAN_EM410X_TAG,
  DATA_CMD_SET_EM410X_EMU_ID,
  useDeviceState,
} from "../../hooks/command";
import { notifyWithStatus } from "../../utils/notify";

const Content = () => {
  const { mutate: mutateWrMap } = useWaitResponseMap();
  const { data: port } = usePort();
  const [id, setId] = useState("");

  const { data: deviceState, mutate: mutateDeviceState } = useDeviceState();

  return (
    <>
      <p>EM410x read/write/emulator</p>
      <ButtonGroup>
        <Button
          disabled={!deviceState.readerMode}
          onClick={() => {
            mutateWrMap({
              [DATA_CMD_SCAN_EM410X_TAG]: {
                callback: (dataCmd, dataStatus, dataResponse) => {
                  mutateDeviceState((data) => ({
                    ...data,
                    EM410x: `EM410x ID(10H):${Buffer.from(
                      dataResponse
                    ).toString("hex")}`,
                  }));
                },
              },
            });

            sendDataViaPort({
              port,
              cmd: DATA_CMD_SCAN_EM410X_TAG,
              status: 0,
            });
          }}
        >
          Read
        </Button>
        <Button>Write</Button>
        <Button
          onClick={() => {
            //DATA_CMD_SET_EM410X_EMU_ID
          }}
        >
          Sim
        </Button>
      </ButtonGroup>
      <Input
        size="mini"
        value={id}
        onChange={(e, data) => {
          setId(data.value);
        }}
        action={{
          disabled: true,
          content: "Set ID",
          onClick: () => {
            mutateWrMap({
              [DATA_CMD_SET_EM410X_EMU_ID]: {
                callback: (dataCmd, dataStatus, dataResponse) => {
                  notifyWithStatus({ dataStatus, text: "Set ID" });
                },
              },
            });
            sendDataViaPort({
              port,
              cmd: DATA_CMD_SET_EM410X_EMU_ID,
              status: 0,
              data: Buffer.from(id),
            });
          },
        }}
      />
    </>
  );
};

export default Content;
