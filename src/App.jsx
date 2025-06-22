
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";
const abi = [
  {
    "inputs": [],
    "name": "getMyEntries",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
          { "internalType": "uint32", "name": "steps", "type": "uint32" },
          { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
          { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
          { "internalType": "string", "name": "note", "type": "string" }
        ],
        "internalType": "struct WeightLossDiary.Entry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [entries, setEntries] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 8453n) {
      alert("Пожалуйста, переключитесь на сеть Base (Chain ID 8453)");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddress(accounts[0]);

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const result = await contract.getMyEntries();
    setEntries(result);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Weight Loss Diary</h1>
      {walletAddress ? (
        <>
          <p>Wallet: {walletAddress}</p>
          <h2>Your Entries:</h2>
          <ul>
            {entries.map((entry, idx) => (
              <li key={idx}>
                {new Date(Number(entry.timestamp) * 1000).toLocaleDateString()}: 
                Weight: {entry.weightKg}kg, 
                Steps: {entry.steps}, 
                In: {entry.caloriesIn}, 
                Out: {entry.caloriesOut}, 
                Note: {entry.note}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={connectWallet}>Подключить MetaMask</button>
      )}
    </div>
  );
}

export default App;
