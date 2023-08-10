import { Buffer } from "buffer";
import struct from "python-struct";

export const DATA_MAX_LENGTH = 512;
export const DATA_FRAME_SOF = 0x11;

export const makeDataFrameBytes = (cmd, status, data = "") => {
  let frame = Buffer.alloc(0);
  //   let lrc = 0x00;

  // sof and sof lrc byte
  frame = Buffer.concat([frame, Buffer.from([DATA_FRAME_SOF])]);
  frame = Buffer.concat([frame, Buffer.from([lrcCalc(frame.slice(0, 1))])]);

  // head info
  frame = Buffer.concat([frame, Buffer.from(pack(">H", cmd))]);
  frame = Buffer.concat([frame, Buffer.from(pack(">H", status))]);
  frame = Buffer.concat([
    frame,
    Buffer.from(pack(">H", data ? data.length : 0)),
  ]);
  frame = Buffer.concat([frame, Buffer.from([lrcCalc(frame.slice(2, 8))])]);

  // data
  if (data) {
    frame = Buffer.concat([frame, data]);
  }

  // frame lrc
  frame = Buffer.concat([frame, Buffer.from([lrcCalc(frame)])]);

  return frame;
};

export const lrcCalc = (array) => {
  // You can call this lrcCalc function in your Node.js code just like you would in Python. Make sure to pass an array of byte values to it to calculate the LRC checksum.

  let ret = 0x00;
  for (let b of array) {
    ret += b;
    ret &= 0xff;
  }
  return (0x100 - ret) & 0xff;
};

export const pack = (format, value) => {
  // Implement the struct.pack logic here
  // This function should convert a value into a byte array
  return struct.pack(format, value);
};
