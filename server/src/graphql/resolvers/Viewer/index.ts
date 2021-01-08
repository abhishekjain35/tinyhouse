import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer } from "../../../lib/types";
import { LogInArgs } from "./types";
import crypto from "crypto";

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (err) {
        throw new Error(`Failed to query Google auth url ${err}`);
      }
    },
  },
  Mutation: {
    logIn: (_root: undefined, { input }: LogInArgs) => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");
      } catch (err) {}
    },
    logOut: () => {
      return "Query.logOut";
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): true | undefined => {
      return viewer.walletId ? true : undefined;
    },
  },
};
