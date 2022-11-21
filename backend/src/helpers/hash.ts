import { randomBytes } from "crypto";

export const generateHash = (length = 32): string => {
  return randomBytes(length).toString("hex");
};
