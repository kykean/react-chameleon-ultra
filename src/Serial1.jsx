import React, { useState, useEffect, useCallback } from "react";
import { Buffer } from "buffer";
import { enqueueSnackbar } from "notistack";

import { threadDataReceive } from "./Thread";
import {
  DATA_FRAME_SOF,
  DATA_MAX_LENGTH,
  makeDataFrameBytes,
} from "./utils/data-frame";
import { useWaitResponseMap } from "./hooks/waitResponseMap";
import { Button, ButtonGroup, Card } from "semantic-ui-react";
import Slot from "./components/Slot";
import { useSWRConfig } from "swr";
import {
  DATA_CMD_CHANGE_MODE,
  DATA_CMD_GET_DEVICE_CHIP_ID,
  DATA_CMD_MF1_NT_LEVEL_DETECT,
  DATA_CMD_SCAN_14A_TAG,
  useDeviceState,
  useSlotsMap,
} from "./hooks/command";
import { parse14AScanTagResult } from "./utils/parse";
import { createCallback } from "./utils/createCallback";
const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const slots = [1, 2, 3, 4, 5, 6, 7, 8];
// let slotsMapState = slots.reduce((acc, cur) => {
//   acc[cur] = {};
//   return acc;
// }, {});

const SerialCommunication = () => {
  const { cache } = useSWRConfig();

  const { data: wrMap, mutate: mutateWrMap } = useWaitResponseMap();
  const [port, setPort] = useState(null);
  const [isSerialSupported, setIsSerialSupported] = useState(false);

  const {
    data: slotsMap,
    isLoadingSlotsMap,
    mutate: mutateSlotsMap,
  } = useSlotsMap();

  const {
    data: deviceState,
    isLoadingDevice,
    mutate: mutateDeviceState,
  } = useDeviceState();
  // const [slotsMap, setSlotsMap] = useState(
  //   slots.reduce((acc, cur) => {
  //     acc[cur] = {};
  //     return acc;
  //   }, {})
  // );

  useEffect(() => {
    // Check if Web Serial API is supported
    if ("serial" in navigator) {
      setIsSerialSupported(true);
    }
    //init
    // mutateDeviceState({});
    mutateWrMap({});
    mutateSlotsMap(
      slots.reduce((acc, cur) => {
        acc[cur] = {};
        return acc;
      }, {})
    );
  }, []);

  const connectSerial = async () => {
    try {
      const serialPort = await navigator.serial.requestPort({
        filters: [{ usbVendorId: 0x6868 }],
      });
      await serialPort.open({ baudRate: 115200, bufferSize: DATA_MAX_LENGTH }); // Adjust baud rate as needed
      setPort(serialPort);
      threadDataReceive(
        serialPort,
        DATA_FRAME_SOF,
        DATA_MAX_LENGTH,
        wrMap,
        cache
      );
    } catch (error) {
      console.error("Error opening serial port:", error);
    }
  };

  const disconnectSerial = async () => {
    window.location.reload();
    // if (port) {
    //   try {
    //     await port.readable.getReader().releaseLock();
    //     await port.close();
    //     setPort(null);
    //   } catch (error) {
    //     console.error("Error closing serial port:", error);
    //   }
    // }
  };

  const sendData = useCallback(
    async ({ cmd, status, data }) => {
      // Usage
      const frame = makeDataFrameBytes(cmd, status, data);

      if (port) {
        console.log(`send ${Buffer.from(frame).toString("hex")}`);
        try {
          const writer = port.writable.getWriter();
          await writer.write(frame);
          writer.releaseLock();
        } catch (error) {
          console.error("Error sending data:", error);
        }
      }
    },
    [port]
  );

  return (
    <div>
      <h1>Chameleon Ultra</h1>
      {isSerialSupported ? (
        <div>
          {!port ? (
            <Button primary onClick={connectSerial}>
              Connect to Serial Port
            </Button>
          ) : (
            <Button secondary onClick={disconnectSerial}>
              Disconnect from Serial Port
            </Button>
          )}
        </div>
      ) : (
        <p>Web Serial API is not supported in this browser.</p>
      )}

      {!!slotsMap && !!deviceState && (
        <div>
          <Card>
            <Card.Content>
              <Card.Header>Device</Card.Header>
              <Card.Meta>meta data</Card.Meta>
              <Card.Description>
                <div style={{ whiteSpace: "pre" }}>
                  {JSON.stringify(deviceState, null, " ")}
                </div>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <div className="ui two buttons">
                <Button
                  basic={!deviceState.readerMode}
                  color="blue"
                  onClick={() => {
                    mutateWrMap({
                      [DATA_CMD_CHANGE_MODE]: {
                        callback: (dataCmd, dataStatus, dataResponse) => {
                          const success = dataStatus === 104;
                          mutateDeviceState((prev) => ({
                            ...prev,
                            readerMode: success,
                          }));
                          enqueueSnackbar(`Set to reader mode`, {
                            variant: success ? "success" : "warning",
                          });
                        },
                      },
                    });

                    sendData({
                      cmd: DATA_CMD_CHANGE_MODE,
                      status: 0x00,
                      data: Buffer.from("01", "hex"), //send 0x0001 reader mode
                    });
                  }}
                >
                  Reader mode
                </Button>
                <Button
                  basic={!!deviceState.readerMode}
                  color="green"
                  onClick={() => {
                    const cb = createCallback(
                      mutateWrMap,
                      DATA_CMD_CHANGE_MODE,
                      (dataCmd, dataStatus, dataResponse) => {
                        console.log(dataStatus);
                        mutateDeviceState((d) => ({
                          ...d,
                          readerMode: false,
                        }));
                        enqueueSnackbar(`Set to Emulator mode success`, {
                          variant: "success",
                        });
                      }
                    );
                    mutateWrMap(cb);

                    sendData({
                      cmd: DATA_CMD_CHANGE_MODE,
                      status: 0x00,
                      data: Buffer.from("00", "hex"),
                    });
                  }}
                >
                  Emulator mode
                </Button>
              </div>
              <ButtonGroup>
                <Button
                  onClick={async () => {
                    const cb = createCallback(
                      mutateWrMap,
                      DATA_CMD_GET_DEVICE_CHIP_ID,
                      (dataCmd, dataStatus, dataResponse) => {
                        mutateDeviceState((d) => ({
                          ...d,
                          chipId: Buffer.from(dataResponse).toString("hex"),
                        }));
                      }
                    );
                    mutateWrMap(cb);

                    sendData({
                      cmd: DATA_CMD_GET_DEVICE_CHIP_ID,
                      status: 0x00,
                    });
                  }}
                >
                  Get Chip ID
                </Button>
                <Button
                  onClick={async () => {
                    const cb = createCallback(
                      mutateWrMap,
                      DATA_CMD_SCAN_14A_TAG,
                      (dataCmd, dataStatus, dataResponse) => {
                        console.log(`14ascan`);
                        console.log(dataResponse);
                        if (dataResponse.length === 0) {
                          enqueueSnackbar("ISO14443-A Tag no found", {
                            variant: "warning",
                          });
                          return;
                        }
                        mutateDeviceState((d) => ({
                          ...d,
                          "14aScan": parse14AScanTagResult(dataResponse),
                        }));
                      }
                    );
                    mutateWrMap(cb);
                    sendData({
                      cmd: DATA_CMD_SCAN_14A_TAG,
                      status: 0x00,
                    });
                  }}
                >
                  14a scan
                </Button>
                <Button
                  onClick={async () => {
                    const cb = createCallback(
                      mutateWrMap,
                      DATA_CMD_MF1_NT_LEVEL_DETECT,
                      (dataCmd, dataStatus, dataResponse) => {
                        let prngLevel = "Unknown";
                        if (dataStatus === 0x00) {
                          prngLevel = "Weak";
                        } else if (dataStatus === 0x24) {
                          prngLevel = "Static";
                        } else if (dataStatus === 0x25) {
                          prngLevel = "Hard";
                        }
                        mutateDeviceState((d) => ({
                          ...d,
                          "14aInfo": `PRNG Level - ${prngLevel}`,
                        }));
                      }
                    );
                    mutateWrMap(cb);
                    sendData({
                      cmd: DATA_CMD_MF1_NT_LEVEL_DETECT,
                      status: 0x00,
                    });
                  }}
                >
                  14a Info
                </Button>
              </ButtonGroup>
            </Card.Content>
          </Card>

          <Card.Group>
            {Object.entries(slotsMap).map(([key, value]) => (
              <Slot key={key} slot={key} value={value} sendData={sendData} />
            ))}
          </Card.Group>
        </div>
      )}
    </div>
  );
};

export default SerialCommunication;
