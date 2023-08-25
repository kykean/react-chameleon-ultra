import { enqueueSnackbar } from "notistack";

export const notifyWithStatus = ({ dataStatus, text }) => {
  const success = dataStatus === 104;
  enqueueSnackbar(text, {
    variant: success ? "success" : "warning",
  });
};
