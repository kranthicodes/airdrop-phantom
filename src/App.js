import React from "react";
import { HiOutlineStatusOnline, HiDesktopComputer } from "react-icons/hi";
import {
  Keypair,
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import "./App.css";

function App() {
  const [_, setWalletExists] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [walletBalance, setWalletBalance] = React.useState(0);

  const [systemSolanaAccount, setSystemSolanaAccount] = React.useState(null);
  const [systemSolanaAccountBal, setSystemSolanaAccountBal] = React.useState(0);
  const [createAccountStatus, setCreateAccountStatus] = React.useState("idle");
  const [transferStatus, setTransferStatus] = React.useState("idle");

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  React.useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletExists();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const checkIfWalletExists = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          setWalletExists(true);
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      const balance = await getBalance(response.publicKey);

      console.log("Connected with Public Key:", response.publicKey.toString());
      console.log("Connected wallet balance:", balance);
      setWalletAddress(response.publicKey.toString());
      setWalletBalance(balance);
    }
  };

  const disconnectWallet = async () => {
    setWalletAddress(null);
  };

  const createSolanaAccountHandler = async () => {
    setCreateAccountStatus("Generating a new Account...");
    const keypair = Keypair.generate();

    setCreateAccountStatus("Airdropping 2SOL...");
    const sig = await connection.requestAirdrop(
      keypair.publicKey,
      2 * LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(sig);

    const balance = await getBalance(keypair.publicKey);
    console.log({ balance });
    setSystemSolanaAccount(keypair);
    setSystemSolanaAccountBal(balance);
  };

  const getBalance = async (pubKey) => {
    const balance = await connection.getBalance(new PublicKey(pubKey));

    return balance;
  };

  const transferHandler = async () => {
    let systemBalance = systemSolanaAccountBal;
    if (systemSolanaAccountBal <= 5000) {
      setTransferStatus("Airdropping into System Account...");

      const sig = await connection.requestAirdrop(
        systemSolanaAccount.publicKey,
        2 * LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(sig);

      systemBalance = await getBalance(systemSolanaAccount.publicKey);
      setSystemSolanaAccountBal(systemBalance);
    }
    setTransferStatus("Transfering...");
    var transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: systemSolanaAccount.publicKey,
        toPubkey: new PublicKey(walletAddress),
        lamports: systemBalance - 5000,
      })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(connection, transaction, [
      systemSolanaAccount,
    ]);

    console.log({ signature });

    const systemBal = await getBalance(systemSolanaAccount.publicKey);
    const walletBal = await getBalance(walletAddress);

    setTransferStatus("Transfered!");
    setSystemSolanaAccountBal(systemBal);
    setWalletBalance(walletBal);

    setTimeout(() => {
      setTransferStatus("idle");
    }, 3000);
  };

  if (!systemSolanaAccount) {
    return (
      <div className="container">
        <nav>
          <div className="phantom-status-container">
            <HiDesktopComputer size="24px" color="red" />
            <p>System Wallet: Not found</p>
          </div>
          <div className="phantom-status-container">
            <HiOutlineStatusOnline size="24px" color="green" />
            <p>Phantom wallet detected</p>
          </div>
        </nav>
        <div className="body">
          <button
            onClick={createSolanaAccountHandler}
            className="create-account-btn"
            disabled={createAccountStatus !== "idle"}
          >
            {createAccountStatus === "idle"
              ? "Create a new Solana account"
              : createAccountStatus}
          </button>
        </div>
      </div>
    );
  }

  if (systemSolanaAccount && !walletAddress) {
    return (
      <div className="container">
        <nav>
          <div className="phantom-status-container">
            <HiDesktopComputer size="24px" color="green" />
            <p>
              System Wallet:{" "}
              {systemSolanaAccount.publicKey.toString().slice(0, 6)}......
              {systemSolanaAccount.publicKey.toString().slice(-7)}
            </p>
            |<p>{systemSolanaAccountBal / LAMPORTS_PER_SOL} SOL</p>
          </div>
          <div className="phantom-status-container">
            <HiOutlineStatusOnline size="24px" color="green" />
            <p>Phantom wallet detected</p>
          </div>
        </nav>
        <div className="body">
          <button onClick={connectWallet} className="create-account-btn">
            Connect your Phantom wallet
          </button>
        </div>
      </div>
    );
  }

  if (systemSolanaAccount && walletAddress) {
    return (
      <div className="container">
        <nav>
          <div className="phantom-status-container">
            <HiDesktopComputer size="24px" color="green" />
            <p>
              System Wallet:{" "}
              {systemSolanaAccount.publicKey.toString().slice(0, 6)}......
              {systemSolanaAccount.publicKey.toString().slice(-7)}
            </p>
            |<p>{systemSolanaAccountBal / LAMPORTS_PER_SOL} SOL</p>
          </div>
          <div className="phantom-status-container">
            <HiOutlineStatusOnline size="24px" color="green" />
            <p>
              Connected Wallet: {walletAddress.slice(0, 6)}......
              {walletAddress.slice(-7)}
            </p>
            |<p>{walletBalance / LAMPORTS_PER_SOL} SOL</p>
          </div>
          <div className="phantom-status-container">
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
        </nav>
        <div className="body">
          <button
            disabled={transferStatus !== "idle"}
            onClick={transferHandler}
            className="create-account-btn"
          >
            {transferStatus === "idle"
              ? "Transfer to connected wallet"
              : transferStatus}
          </button>
        </div>
      </div>
    );
  }
}

export default App;
