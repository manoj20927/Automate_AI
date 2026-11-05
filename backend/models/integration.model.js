import mongoose from "mongoose";

// One row per connected account. Tokens are stored encrypted (see utils/tokenCrypto.js)
const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: ["google", "instagram"],
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

const Integration = mongoose.model("Integration", integrationSchema);

export default Integration;
