import { IResolvers } from "apollo-server-express";
import { Google } from "../../../lib/api";
import { Viewer, Database, User } from "../../../lib/types";
import { LogInArgs } from "./types";
import crypto from "crypto";

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);
  if (!user) {
    throw new Error("Google Login Error");
  }

  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;

  const name = userNamesList ? userNamesList[0].displayName : null;
  const _id =
    userNamesList &&
    userNamesList[0].metadata &&
    userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  const avatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!_id || !name || !avatar || !userEmail) {
    throw new Error("Google login error");
  }
  const updateRes = await db.users.findOneAndUpdate(
    { _id },
    {
      $set: {
        name,
        avatar,
        contact: userEmail,
        token,
      },
    },
    { returnOriginal: false }
  );

  let viewer = updateRes.value;

  if (!viewer) {
    const insertRes = await db.users.insertOne({
      _id,
      name,
      avatar,
      contact: userEmail,
      token,
      income: 0,
      bookings: [],
      listings: [],
    });
    viewer = insertRes.ops[0];
  }

  return viewer;
};

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
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db }: { db: Database }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString("hex");
        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db)
          : undefined;

        if (!viewer) {
          return { didRequest: true };
        }

        const { _id, token: userToken, walletId, avatar } = viewer;
        return {
          _id,
          walletId,
          avatar,
          token: userToken,
          didRequest: true,
        };
      } catch (err) {
        throw new Error(`Failed to login: ${err}`);
      }
    },
    logOut: (): Viewer => {
      try {
        return { didRequest: true };
      } catch (error) {
        throw new Error("Failed to Logout" + error);
      }
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
