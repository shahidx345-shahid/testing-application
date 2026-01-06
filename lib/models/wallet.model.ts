import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: string;
  balance: number;
  availableBalance: number;
  locked: number;
  lockedInPockets: number;
  referralEarnings: number;
  totalBalance: number;
  lastDailySavingDate?: Date;
  currentStreak: number;
  dailySavingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    locked: {
      type: Number,
      default: 0,
    },
    lockedInPockets: {
      type: Number,
      default: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    totalBalance: {
      type: Number,
      default: 0,
    },
    lastDailySavingDate: Date,
    currentStreak: {
      type: Number,
      default: 0,
    },
    dailySavingAmount: {
      type: Number,
      default: 27.4,
    },
  },
  { timestamps: true }
);

// Calculate totalBalance before saving
WalletSchema.pre<IWallet>("save", function (next) {
  this.totalBalance = this.balance + this.locked + this.referralEarnings;
  next();
});

export const Wallet =
  mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
