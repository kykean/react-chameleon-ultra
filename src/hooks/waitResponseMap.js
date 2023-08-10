import useSWR from "swr";

const WAIT_RESPONSE_MAP = "WAIT_RESPONSE_MAP";
let waitResponseMap = {};

export const useWaitResponseMap = (option) =>
  useSWR(WAIT_RESPONSE_MAP, () => waitResponseMap, {
    revalidateOnFocus: false,
    ...option,
  });
