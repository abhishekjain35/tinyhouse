import { Collection, ObjectId } from "mongodb";

export interface Listing {
  _id: ObjectId;
}

export interface User {
  _id: ObjectId;
}

export interface Bookings {
  _id: ObjectId;
}

export interface Database {
  bookings: Collection<Bookings>; 
  listings: Collection<Listing>;
  users: Collection<User>;
}
