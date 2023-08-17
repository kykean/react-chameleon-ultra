import useSWR from "swr";
import useSWRMutation from "swr/mutation";

// ******************************************************************
//                      CMD for device
//                  Range from 1000 -> 1999
// ******************************************************************

export const DATA_CMD_GET_APP_VERSION = 1000;
export const DATA_CMD_CHANGE_MODE = 1001;
export const DATA_CMD_GET_DEVICE_MODE = 1002;
export const DATA_CMD_SET_SLOT_ACTIVATED = 1003;
export const DATA_CMD_SET_SLOT_TAG_TYPE = 1004;
export const DATA_CMD_SET_SLOT_DATA_DEFAULT = 1005;
export const DATA_CMD_SET_SLOT_ENABLE = 1006;
export const DATA_CMD_SET_SLOT_TAG_NICK = 1007;
export const DATA_CMD_GET_SLOT_TAG_NICK = 1008;
export const DATA_CMD_SLOT_DATA_CONFIG_SAVE = 1009;
export const DATA_CMD_ENTER_BOOTLOADER = 1010;
export const DATA_CMD_GET_DEVICE_CHIP_ID = 1011;
export const DATA_CMD_GET_DEVICE_ADDRESS = 1012;

// ******************************************************************
//                      CMD for hf reader
//                  Range from 2000 -> 2999
// ******************************************************************
//

export const DATA_CMD_SCAN_14A_TAG = 2000;
export const DATA_CMD_MF1_SUPPORT_DETECT = 2001;
export const DATA_CMD_MF1_NT_LEVEL_DETECT = 2002;
export const DATA_CMD_MF1_DARKSIDE_DETECT = 2003;
export const DATA_CMD_MF1_DARKSIDE_ACQUIRE = 2004;
export const DATA_CMD_MF1_NT_DIST_DETECT = 2005;
export const DATA_CMD_MF1_NESTED_ACQUIRE = 2006;
export const DATA_CMD_MF1_CHECK_ONE_KEY_BLOCK = 2007;
export const DATA_CMD_MF1_READ_ONE_BLOCK = 2008;
export const DATA_CMD_MF1_WRITE_ONE_BLOCK = 2009;

// ******************************************************************
//                      CMD for lf reader
//                  Range from 3000 -> 3999
// ******************************************************************
//

export const DATA_CMD_SCAN_EM410X_TAG = 3000;
export const DATA_CMD_WRITE_EM410X_TO_T5577 = 3001;

// ******************************************************************
//                      CMD for hf emulator
//                  Range from 4000 -> 4999
// ******************************************************************
//

export const DATA_CMD_LOAD_MF1_BLOCK_DATA = 4000;
export const DATA_CMD_SET_MF1_ANTI_COLLISION_RES = 4001;
// ******************************************************************
//                      CMD for lf emulator
//                  Range from 5000 -> 5999
// ******************************************************************
export const DATA_CMD_SET_EM410X_EMU_ID = 5000;
export const DATA_CMD_SET_MF1_DETECTION_ENABLE = 5003;
export const DATA_CMD_GET_MF1_DETECTION_COUNT = 5004;
export const DATA_CMD_GET_MF1_DETECTION_RESULT = 5005;

export const DEVICE_STATE = "DEVICE_STATE";
export const SLOTS_MAP = "SLOTS_MAP";

export const useDeviceState = (option) =>
  useSWR(DEVICE_STATE, {
    fallbackData: {
      readerMode: false,
      chipId: "",
    },
    ...option,
  });

export const useGetChipId = () => useSWRMutation(DEVICE_STATE);
export const useSlotsMap = (option) => useSWR(SLOTS_MAP, { ...option });
