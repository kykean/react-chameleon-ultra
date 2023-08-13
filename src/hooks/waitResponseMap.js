import useSWR from "swr";

const WAIT_RESPONSE_MAP = "WAIT_RESPONSE_MAP";

export const useWaitResponseMap = (option) =>
  useSWR(WAIT_RESPONSE_MAP, {
    revalidateOnFocus: false,
    ...option,
  });
