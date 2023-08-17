export const createCallback = (mutator, key, callback) => {
  return {
    [key]: {
      callback: (dataCmd, dataStatus, dataResponse) => {
        callback(dataCmd, dataStatus, dataResponse);
        mutator((prev) => ({ ...prev, [key]: undefined }));
      },
    },
  };
};
