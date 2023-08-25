import React, { useCallback, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Dropdown,
  Input,
  Label,
  Menu,
} from "semantic-ui-react";
import { Buffer } from "buffer";

import { useWaitResponseMap } from "../hooks/waitResponseMap";
import {
  DATA_CMD_GET_SLOT_TAG_NICK,
  DATA_CMD_SCAN_EM410X_TAG,
  DATA_CMD_SET_SLOT_ACTIVATED,
  DATA_CMD_SET_SLOT_ENABLE,
  DATA_CMD_SET_SLOT_TAG_NICK,
  DATA_CMD_SET_SLOT_TAG_TYPE,
  useSlotsMap,
} from "../hooks/command";
import { enqueueSnackbar } from "notistack";
import { tagOptions } from "../hooks/tag-types";
import { notifyWithStatus } from "../utils/notify";

const Slot = (props) => {
  const { slot, sendData } = props;
  const [inputData, setInputData] = useState({ nickSt1: "" });
  const { data: wrMap, mutate: mutateWrMap } = useWaitResponseMap();
  const {
    data: slotsMap,
    isLoadingSlotsMap,
    mutate: mutateSlotsMap,
  } = useSlotsMap();

  const setSlotType = useCallback(
    ({ slot, text, value }) => {
      mutateWrMap({
        [DATA_CMD_SET_SLOT_TAG_TYPE]: {
          callback: (dataCmd, dataStatus, dataResponse) => {
            notifyWithStatus({
              dataStatus,
              text: `Set slot ${slot} to ${text}`,
            });
          },
        },
      });
      sendData({
        cmd: DATA_CMD_SET_SLOT_TAG_TYPE,
        status: 0x00,
        data: Buffer.from(`0${slot - 1}0${value}`, "hex"),
      });
    },
    [mutateWrMap, sendData]
  );

  return (
    <Card>
      <Card.Content>
        <Label attached="top right">{slot}</Label>
        <Card.Header>Header</Card.Header>
        <Card.Meta>Meta data</Card.Meta>
        <Card.Description>{JSON.stringify(slotsMap[slot])}</Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Button.Group>
          <Button
            basic
            color="blue"
            onClick={() => {
              mutateWrMap({
                [DATA_CMD_SET_SLOT_ACTIVATED]: {
                  callback: (dataCmd, dataStatus, dataResponse) => {
                    const success = dataStatus === 104;
                    enqueueSnackbar(`Activate slot ${slot}`, {
                      variant: success ? "success" : "warning",
                    });
                  },
                },
              });

              sendData({
                cmd: DATA_CMD_SET_SLOT_ACTIVATED,
                status: 0x00,
                data: Buffer.from(`0${slot - 1}`, "hex"),
              });
            }}
          >
            Activate
          </Button>
          <Button
            basic
            color="green"
            onClick={() => {
              mutateWrMap({
                [DATA_CMD_SET_SLOT_ENABLE]: {
                  callback: (dataCmd, dataStatus, dataResponse) => {
                    const success = dataStatus === 104;
                    enqueueSnackbar(`Enable slot ${slot}`, {
                      variant: success ? "success" : "warning",
                    });
                  },
                },
              });

              sendData({
                cmd: DATA_CMD_SET_SLOT_ENABLE,
                status: 0x00,
                data: Buffer.from(`0${slot - 1}01`, "hex"),
              });
            }}
          >
            Enable
          </Button>
          <Button
            basic
            color="red"
            onClick={() => {
              mutateWrMap({
                [DATA_CMD_SET_SLOT_ENABLE]: {
                  callback: (dataCmd, dataStatus, dataResponse) => {
                    const success = dataStatus === 104;
                    enqueueSnackbar(`Disable slot ${slot}`, {
                      variant: success ? "success" : "warning",
                    });
                  },
                },
              });

              sendData({
                cmd: DATA_CMD_SET_SLOT_ENABLE,
                status: 0x00,
                data: Buffer.from(`0${slot - 1}00`, "hex"),
              });
            }}
          >
            Disable
          </Button>
        </Button.Group>
        <div>
          <Input
            size="mini"
            value={inputData.nickSt1}
            onChange={(e, data) => {
              setInputData((prev) => ({ ...prev, nickSt1: data.value }));
            }}
            action={{
              content: "set Nick st1",
              onClick: () => {
                mutateWrMap({
                  [DATA_CMD_SET_SLOT_TAG_NICK]: {
                    callback: (dataCmd, dataStatus, dataResponse) => {
                      const success = dataStatus === 104;
                      enqueueSnackbar(`Set nickSt1`, {
                        variant: success ? "success" : "warning",
                      });
                    },
                  },
                });
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
        </div>

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
        {/* <div>
          <Dropdown
            placeholder="Slot type"
            search
            selection
            options={tagOptions}
          />
        </div> */}
        <Menu vertical>
          <Dropdown item text="Slot type" pointing="left">
            <Dropdown.Menu>
              {tagOptions.map((type) => {
                return (
                  <Dropdown.Item
                    key={type.value}
                    {...type}
                    onClick={(e, v) => {
                      setSlotType({ slot, text: v.text, value: v.value });
                    }}
                  />
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </Menu>
      </Card.Content>
    </Card>
  );
};

export default Slot;
