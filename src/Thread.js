// const { ReadableStreamDefaultReader } = require('web-streams-polyfill/ponyfill/es2018');
import { Buffer } from "buffer";

async function readInto(reader, buffer) {
  let offset = 0;
  while (offset < buffer.byteLength) {
    const { value, done } = await reader.read(new Uint8Array(buffer, offset));
    if (done) {
      break;
    }
    buffer = value.buffer;
    offset += value.byteLength;
  }
  return buffer;
}
let buffer1 = new ArrayBuffer(1);

export const threadDataReceive = async (
  serialPort,
  dataFrameSof,
  dataMaxLength = 512,
  waitResponseMap
) => {
  const dataBuffer = [];
  let dataPosition = 0;
  let dataCmd = 0x0000;
  let dataStatus = 0x0000;
  let dataLength = 0x0000;

  const reader = serialPort.readable.getReader({ mode: "byob" });

  try {
    while (true) {
      const { value, done } = await reader.read(
        new Uint8Array(new ArrayBuffer(1))
      );
      if (done) {
        reader.releaseLock();
        break;
      }

      const dataByte = value[0];
      dataBuffer.push(dataByte);

      if (dataPosition < 2) {
        if (dataPosition === 0) {
          if (dataBuffer[dataPosition] !== dataFrameSof) {
            dataPosition = 0;
            dataBuffer.length = 0;
            continue;
          }
        } else if (dataPosition === 1) {
          const lrc = lrcCalc(new Uint8Array(dataBuffer.slice(0, 1)));
          if (dataBuffer[dataPosition] !== lrc) {
            dataPosition = 0;
            dataBuffer.length = 0;
            continue;
          }
        }
      } else if (dataPosition === 8) {
        const headLrc = lrcCalc(new Uint8Array(dataBuffer.slice(0, 8)));
        if (dataBuffer[dataPosition] !== headLrc) {
          dataPosition = 0;
          dataBuffer.length = 0;
          continue;
        }
        dataCmd = readUInt16BE(dataBuffer.slice(2, 4));
        dataStatus = readUInt16BE(dataBuffer.slice(4, 6));
        dataLength = readUInt16BE(dataBuffer.slice(6, 8));
        if (dataLength > dataMaxLength) {
          dataPosition = 0;
          dataBuffer.length = 0;
          continue;
        }
      } else if (dataPosition > 8 && dataPosition === 8 + dataLength + 1) {
        const dataLrc = lrcCalc(new Uint8Array(dataBuffer.slice(0, -1)));
        if (dataBuffer[dataPosition] === dataLrc) {
          // Handle data here
          console.log(
            `Buffer data = ${Buffer.from(dataBuffer).toString("hex")}`
          );
          if (dataCmd in waitResponseMap) {
            const callback = waitResponseMap[dataCmd]?.callback;
            const dataResponse = Buffer.from(
              dataBuffer.slice(9, 9 + dataLength)
            );
            if (typeof callback === "function") {
              callback(dataCmd, dataStatus, dataResponse);
              delete waitResponseMap[dataCmd];
            } else {
              waitResponseMap[dataCmd].response = {
                dataCmd,
                dataStatus,
                dataResponse,
              };
            }
          } else {
            console.log(`No task wait process: ${dataCmd}`);
          }
        }
        dataPosition = 0;
        dataBuffer.length = 0;
        continue;
      }

      dataPosition += 1;
    }
  } catch (error) {
    console.error("Error reading data:", error);
  } finally {
    reader.releaseLock();
  }
};

// Helper function to calculate LRC
function lrcCalc(array) {
  let ret = 0x00;
  for (let b of array) {
    ret += b;
    ret &= 0xff;
  }
  return (0x100 - ret) & 0xff;
}

// Helper function to read UInt16BE
function readUInt16BE(buffer) {
  return (buffer[0] << 8) | buffer[1];
}

// Example usage
// const serialPort = /* obtain serial port object */;
// const dataFrameSof = /* set data frame sof value */;
// const dataMaxLength = /* set maximum data length */;
// const waitResponseMap = {}; // You need to populate this map with the relevant data

// threadDataReceive(serialPort, dataFrameSof, dataMaxLength, waitResponseMap);
