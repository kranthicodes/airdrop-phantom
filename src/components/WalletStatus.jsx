import React from "react";
import { HiOutlineStatusOnline } from "react-icons/hi";

export default function WalletStatus({ walletExists }) {
  return (
    <div className="phantom-status-container">
      <HiOutlineStatusOnline
        size="24px"
        color={walletExists ? "green" : "red"}
      />
      <p>
        {walletExists ? "Phantom wallet detected" : "Phantom wallet not found"}
      </p>
    </div>
  );
}
