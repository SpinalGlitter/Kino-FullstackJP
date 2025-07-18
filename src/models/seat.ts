import mongoose, { Schema, Types } from "mongoose";

interface ISeat {
  _id: Types.ObjectId | string;
  row: number;
  seatNumber: number;
}

const SeatSchema = new Schema<ISeat>(
  {
    row: { type: Number, required: true },
    seatNumber: { type: Number, required: true },
  },
  { collection: "seatings" }
);

const Seat = mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);
export default Seat;
