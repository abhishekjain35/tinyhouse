import { MongoClient } from "mongodb";
import { Database } from "../lib/types";

const url = `${process.env.MONGODB_CONNECTION_STRING}`;

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("tinyhouse");

  return {
    listings: db.collection("test_listings"),
  };
};
