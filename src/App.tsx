// @ts-nocheck
import { useState } from "react";
// import './App.css'
import useSWR from "swr";
import { Button, Container } from "semantic-ui-react";
import { Buffer } from "buffer";
import struct from "python-struct";
import SerialCommunication from "./Serial1";

const BATTERY_STATUS = "BATTERY_STATUS";
const SOF = 0x11;

const scan14a = () => {
  let bytes = Buffer.from([
    SOF,
    calculateLRC(SOF),
    1011, // CMD
    0x00, //status
    0, //len of data
    calculateLRC([calculateLRC(SOF), 1011, 0, 0].join("")),
  ]);
  let frameLfc = calculateLRC(bytes.toString());

  return Buffer.concat([bytes, Buffer.from(frameLfc)]);
};

function App() {
  const [count, setCount] = useState(0);
  const { data: server, isLoading, mutate } = useSWR("ChameleonUltra");
  return (
    <Container>
      <SerialCommunication />
    </Container>
  );
}

export default App;
