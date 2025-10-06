import mongoose from "mongoose";

const valutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    username: String,
    password: String,
    url: String,
    notes: String,
  },
  { timestamps: true }
);

const Vault = mongoose.model("vault", valutSchema);

export default Vault;
