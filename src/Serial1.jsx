import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";

import { threadDataReceive } from "./Thread";
import {
  DATA_FRAME_SOF,
  DATA_MAX_LENGTH,
  makeDataFrameBytes,
} from "./utils/data-frame";
import { useWaitResponseMap } from "./hooks/waitResponseMap";

const SerialCommunication = () => {
  const { data: wrMap, mutate } = useWaitResponseMap();
  const [port, setPort] = useState(null);
  const [receivedData, setReceivedData] = useState("");
  const [outputData, setOutputData] = useState("");
  const [isSerialSupported, setIsSerialSupported] = useState(false);

  useEffect(() => {
    // Check if Web Serial API is supported
    if ("serial" in navigator) {
      setIsSerialSupported(true);
    }
  }, []);

  const connectSerial = async () => {
    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 115200, bufferSize: DATA_MAX_LENGTH }); // Adjust baud rate as needed
      setPort(serialPort);
      threadDataReceive(
        serialPort,
        DATA_FRAME_SOF,
        DATA_MAX_LENGTH,
        wrMap
        //   {
        //   1011: {
        //     callback: (dataCmd, dataStatus, dataResponse) => {
        //       console.log(
        //         `this is data ${Buffer.from(dataResponse).toString("hex")}`
        //       );
        //     },
        //   },
        // }
      );
      // readData(serialPort);
    } catch (error) {
      console.error("Error opening serial port:", error);
    }
  };

  const disconnectSerial = async () => {
    if (port) {
      try {
        await port.close();
        setPort(null);
      } catch (error) {
        console.error("Error closing serial port:", error);
      }
    }
  };

  const sendData = async () => {
    // Usage
    // const dataFrameMaker = new DataFrameMaker();
    const cmd = 1011; // Example command
    const status = 0x00; // Example status
    // const data = Buffer.from([1, 2, 3]); // Example data
    const data = undefined;
    const frame = makeDataFrameBytes(cmd, status, data);
    console.log(frame);

    if (port && outputData) {
      console.log("Send data");
      try {
        const writer = port.writable.getWriter();
        // await writer.write(outputData);
        mutate((currentData) => ({
          ...currentData,
          [cmd]: {
            callback: (dataCmd, dataStatus, dataResponse) => {
              console.log(
                `this is data ${Buffer.from(dataResponse).toString("hex")}`
              );
              mutate();
            },
          },
        }));
        await writer.write(frame);
        writer.releaseLock();
      } catch (error) {
        console.error("Error sending data:", error);
      }
    }
  };

  return (
    <div>
      <h1>Web Serial Communication</h1>
      {isSerialSupported ? (
        <div>
          {!port ? (
            <button onClick={connectSerial}>Connect to Serial Port</button>
          ) : (
            <button onClick={disconnectSerial}>
              Disconnect from Serial Port
            </button>
          )}
          <br />
          <textarea
            value={outputData}
            onChange={(e) => setOutputData(e.target.value)}
            placeholder="Enter data to send..."
          />
          <button onClick={sendData}>Send Data</button>
          <br />
          <div>
            <h3>Received Data:</h3>
            <pre>{receivedData}</pre>
          </div>
        </div>
      ) : (
        <p>Web Serial API is not supported in this browser.</p>
      )}
    </div>
  );
};

export default SerialCommunication;
//11efbfbd03efbfbd00680008efbfbdefbfbd31efbfbdefbfbd0defbfbdefbfbdefbfbdefbfbd
