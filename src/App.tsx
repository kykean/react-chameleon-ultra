// @ts-nocheck
import { useState } from "react";
// import './App.css'
import useSWR from "swr";
import { Button, Container } from "semantic-ui-react";
import { Buffer } from "buffer";
import struct from "python-struct";
import SerialCommunication from "./Serial1";

var port = "";

const BATTERY_STATUS = "BATTERY_STATUS";
const SOF = 0x11;

function calculateLRC(str) {
  var bytes = [];
  var lrc = 0;
  for (var i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  for (var i = 0; i < str.length; i++) {
    lrc ^= bytes[i];
  }
  return String.fromCharCode(lrc);
}

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
  // const { data: battery } = useSWR(
  //   // server ? [BATTERY_STATUS, server] : null,
  //   null,
  //   ([key, server]) => {
  //     // Getting Battery Service…
  //     return server
  //       .getPrimaryService("battery_service")
  //       .then((service) => {
  //         // Getting Battery Level Characteristic…
  //         return service.getCharacteristic("battery_level");
  //       })
  //       .then((characteristic) => {
  //         // Reading Battery Level…
  //         return characteristic.readValue();
  //       })
  //       .then((value) => {
  //         return value;
  //       });
  //   },
  //   {
  //     revalidateOnFocus: false,
  //     onSuccess: (value) => {
  //       console.log(`Battery percentage is ${value.getUint8(0)}`);
  //     },
  //     onError: console.log,
  //   }
  // );
  return <SerialCommunication />;
  return (
    <Container>
      <div>
        {/* <Button
          onClick={async () => {
            await navigator.bluetooth
              .requestDevice({
                filters: [
                  { name: "ChameleonUltra" },
                  { services: ["battery_service"] },
                ],
                // acceptAllDevices: true
              })
              .then((device) => {
                console.log(`Name: ${device.name}`);
                // Do something with the device.
                const connected = device!.gatt!.connect();
                mutate(connected);
                return connected;
              })
              .catch((error) =>
                console.error(`Something went wrong. ${error}`)
              );
          }}
        >
          Connect BLE
        </Button> */}
        {/* <Button
          onClick={() => {
            navigator.usb.getDevices().then((devices) => {
              console.log(`Total devices: ${devices.length}`);
              devices.forEach((device) => {
                console.log(
                  `Product name: ${device.productName}, serial number ${device.serialNumber}`
                );
              });
            });
          }}
        >
          List USB
        </Button> */}
        {/* <Button
          onClick={() => {
            navigator.usb
              .requestDevice({ filters: [{ vendorId: 0x6868 }] })
              .then((device) => {
                console.log(device.productName); // "Arduino Micro"
                console.log(device.manufacturerName); // "Arduino LLC"

                return (
                  device
                    .open()
                    // .then(() => device.reset())
                    .then(() => device.selectConfiguration(1))
                    .then(() => {
                      console.log(device.configuration.interfaces);
                      return device.claimInterface(
                        device.configuration.interfaces[1].interfaceNumber
                      );
                    })
                    .then(() => {
                      mutate(device);
                    })
                );
              })
              .catch((error) => {
                console.error(error);
              });
          }}
        >
          USB
        </Button> */}

        <Button
          onClick={async () => {
            const filters = [{ usbVendorId: 0x6868 }];
            port = await navigator.serial.requestPort({ filters });
            console.log(port.getInfo());
            await port.open({ baudRate: 115200 });
          }}
        >
          Connect Serial
        </Button>
        <Button
          onClick={async () => {
            const writer = port.writable.getWriter();
            await writer.write(scan14a());
            // Allow the serial port to be closed later.
            writer.releaseLock();
          }}
        >
          Write Serial
        </Button>

        <Button
          onClick={async () => {
            // Listen to data coming from the serial device.
            const reader = port.readable.getReader();
            const { value, done } = await reader.read();
            if (done) {
              // Allow the serial port to be closed later.
              reader.releaseLock();
            }
            // value is a Uint8Array.
            console.log(value);
          }}
        >
          Read Serial
        </Button>
        <Button
          onClick={async () => {
            const resp = await server.transferOut(2, scan14a());
            console.log(resp);
            await server.close();
          }}
        >
          Send
        </Button>
      </div>
    </Container>
  );
}

export default App;
