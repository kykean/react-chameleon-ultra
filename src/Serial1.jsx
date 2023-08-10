import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import struct from "python-struct";
import { threadDataReceive } from "./Thread";

class DataFrameMaker {
  makeDataFrameBytes(cmd, status, data = "") {
    let frame = Buffer.alloc(0);
    let lrc = 0x00;

    // sof and sof lrc byte
    frame = Buffer.concat([frame, Buffer.from([this.dataFrameSof])]);
    frame = Buffer.concat([
      frame,
      Buffer.from([this.lrcCalc(frame.slice(0, 1))]),
    ]);

    // head info
    frame = Buffer.concat([frame, Buffer.from(this.pack(">H", cmd))]);
    frame = Buffer.concat([frame, Buffer.from(this.pack(">H", status))]);
    frame = Buffer.concat([
      frame,
      Buffer.from(this.pack(">H", data ? data.length : 0)),
    ]);
    frame = Buffer.concat([
      frame,
      Buffer.from([this.lrcCalc(frame.slice(2, 8))]),
    ]);

    // data
    if (data) {
      frame = Buffer.concat([frame, data]);
    }

    // frame lrc
    frame = Buffer.concat([frame, Buffer.from([this.lrcCalc(frame)])]);

    return frame;
  }

  pack(format, value) {
    // Implement the struct.pack logic here
    // This function should convert a value into a byte array
    return struct.pack(format, value);
  }

  lrcCalc(array) {
    // You can call this lrcCalc function in your Node.js code just like you would in Python. Make sure to pass an array of byte values to it to calculate the LRC checksum.

    let ret = 0x00;
    for (let b of array) {
      ret += b;
      ret &= 0xff;
    }
    return (0x100 - ret) & 0xff;
  }

  get dataFrameSof() {
    // Implement the logic to get the data_frame_sof value
    // Replace this with the actual value or calculation
    return 0x11;
  }
}

// Usage
const dataFrameMaker = new DataFrameMaker();
const cmd = 1011; // Example command
const status = 0x00; // Example status
// const data = Buffer.from([1, 2, 3]); // Example data
const data = undefined;
const frame = dataFrameMaker.makeDataFrameBytes(cmd, status, data);
console.log(frame);

const SerialCommunication = () => {
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
      await serialPort.open({ baudRate: 115200, bufferSize: 512 }); // Adjust baud rate as needed
      setPort(serialPort);
      threadDataReceive(serialPort, 0x11, 512, {
        1011: {
          callback: (dataCmd, dataStatus, dataResponse) => {
            console.log(
              `this is data ${Buffer.from(dataResponse).toString("hex")}`
            );
          },
        },
      });
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

  const readData = async (serialPort) => {
    // const textDecoder = new TextDecoderStream();
    // const readableStreamClosed = serialPort.readable.pipeTo(
    //   textDecoder.writable
    // );
    // const reader = textDecoder.readable.getReader();
    const reader = port.readable.getReader({ mode: "byob" });

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        setReceivedData(value);
        console.log(Buffer.from(value, "utf8").toString("hex"));
      }
    } catch (error) {
      console.error("Error reading data:", error);
    } finally {
      reader.releaseLock();
    }
  };

  const sendData = async () => {
    if (port && outputData) {
      console.log("Send data");
      try {
        const writer = port.writable.getWriter();
        // await writer.write(outputData);
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
