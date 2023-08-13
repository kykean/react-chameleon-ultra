import React, { useState } from "react";
import { Button, Card, Input, Label } from "semantic-ui-react";
import { Buffer } from "buffer";

import { useWaitResponseMap } from "../hooks/waitResponseMap";
import {
  DATA_CMD_GET_SLOT_TAG_NICK,
  DATA_CMD_SET_SLOT_TAG_NICK,
  useSlotsMap,
} from "../hooks/command";

const Slot = (props) => {
  const { slot, sendData } = props;
  const [inputData, setInputData] = useState({ nickSt1: "" });
  const { data: wrMap, mutate: mutateWrMap } = useWaitResponseMap();
  const {
    data: slotsMap,
    isLoadingSlotsMap,
    mutate: mutateSlotsMap,
  } = useSlotsMap();

  return (
    <Card>
      <Card.Content>
        <Label attached="top right">{slot}</Label>
        <Card.Header>Steve Sanders</Card.Header>
        <Card.Meta>Friends of Elliot</Card.Meta>
        <Card.Description>{JSON.stringify(slotsMap[slot])}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className="ui two buttons">
          <Button basic color="green">
            Enable
          </Button>
          <Button basic color="red">
            Disable
          </Button>
        </div>

        <Input
          value={inputData.nickSt1}
          onChange={(e, data) => {
            setInputData((prev) => ({ ...prev, nickSt1: data.value }));
          }}
          action={{
            content: "set Nick st1",
            onClick: () => {
              // mutateWrMap({
              //   [DATA_CMD_SET_SLOT_TAG_NICK]: {
              //     callback: (dataCmd, dataStatus, dataResponse) => {
              //       mutateSlotsMap((data) => ({
              //         ...data,
              //         [slot]: {
              //           ...data[slot],
              //           nick1: Buffer.from(dataResponse).toString(),
              //         },
              //       }));
              //     },
              //   },
              // });
              const buf1 = Buffer.from([slot, 1]);
              const buf = Buffer.from(inputData.nickSt1, "utf8");
              sendData({
                cmd: DATA_CMD_SET_SLOT_TAG_NICK,
                status: 0,
                data: Buffer.concat([buf1, buf]),
              });
            },
          }}
        />

        <Button.Group widths={2}>
          <Button
            onClick={() => {
              mutateWrMap({
                [DATA_CMD_GET_SLOT_TAG_NICK]: {
                  callback: (dataCmd, dataStatus, dataResponse) => {
                    mutateSlotsMap((data) => ({
                      ...data,
                      [slot]: {
                        ...data[slot],
                        nick1: Buffer.from(dataResponse).toString(),
                      },
                    }));
                  },
                },
              });

              sendData({
                cmd: DATA_CMD_GET_SLOT_TAG_NICK,
                status: 0,
                data: Buffer.from([slot, 1]), //[slot, sense_type]
              });
            }}
          >
            Get nick st 1
          </Button>
          <Button>Get nick st 2</Button>
        </Button.Group>
      </Card.Content>
    </Card>
  );
};

export default Slot;
