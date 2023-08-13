import React, { useState, useEffect, useCallback } from "react";
import { Buffer } from "buffer";

import { threadDataReceive } from "./Thread";
import {
  DATA_FRAME_SOF,
  DATA_MAX_LENGTH,
  makeDataFrameBytes,
} from "./utils/data-frame";
import { useWaitResponseMap } from "./hooks/waitResponseMap";
import {
  Button,
  Card,
  Container,
  Grid,
  Label,
  Segment,
} from "semantic-ui-react";
import Slot from "./components/Slot";
import useSWR, { useSWRConfig } from "swr";
import {
  DATA_CMD_GET_DEVICE_CHIP_ID,
  useDeviceState,
  useSlotsMap,
} from "./hooks/command";

const slots = [1, 2, 3, 4, 5, 6, 7, 8];
let slotsMapState = slots.reduce((acc, cur) => {
  acc[cur] = {};
  return acc;
}, {});

const SerialCommunication = () => {
  const { cache } = useSWRConfig();

  const { data: wrMap, mutate: mutateWrMap } = useWaitResponseMap();
  const [port, setPort] = useState(null);
  const [receivedData, setReceivedData] = useState("");
  const [outputData, setOutputData] = useState("");
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
    mutateDeviceState({});
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
    if (port) {
      try {
        await port.readable.getReader().releaseLock();
        await port.close();
        setPort(null);
      } catch (error) {
        console.error("Error closing serial port:", error);
      }
    }
  };

  const sendData = useCallback(
    async ({ cmd, status, data }) => {
      // Usage
      const frame = makeDataFrameBytes(cmd, status, data);
      console.log(frame);

      if (port) {
        console.log("Send data");
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
      <h1>Web Serial Communication</h1>
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
          <Button
            onClick={async () => {
              // await mutateWrMap((currentData) => ({
              //   ...currentData,
              //   [DATA_CMD_GET_DEVICE_CHIP_ID]: {
              //     callback: (dataCmd, dataStatus, dataResponse) => {
              //       mutateDeviceState((d) => ({ ...d, chipId: dataResponse }));
              //     },
              //   },
              // }));
              await mutateWrMap({
                [DATA_CMD_GET_DEVICE_CHIP_ID]: {
                  callback: (dataCmd, dataStatus, dataResponse) => {
                    mutateDeviceState((d) => ({
                      ...d,
                      chipId: Buffer.from(dataResponse).toString("hex"),
                    }));
                  },
                },
              });

              sendData({
                cmd: DATA_CMD_GET_DEVICE_CHIP_ID,
                status: 0x00,
              });
            }}
          >
            Read ChipID
          </Button>
          <Container>{JSON.stringify(deviceState)}</Container>
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
