import useSWR from "swr";
import { makeDataFrameBytes } from "../utils/data-frame";
import { Buffer } from "buffer";

const PORT = "PORT";
export const usePort = (key = PORT, option) => useSWR(key, option);

export const sendDataViaPort = async ({ port, cmd, status, data }) => {
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
};
