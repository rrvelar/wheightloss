import { useState } from "react";
import { ethers } from "ethers";

const EXPECTED_CHAIN_ID = 8453;
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd"; // вставь сюда адрес контракта
const abi = [
  {
    "inputs": [
      { "internalType": "uint16", "name": "weightKg", "type": "uint16" },
      { "internalType": "uint32", "name": "steps", "type": "uint32" },
      { "internalType": "uint16", "name": "caloriesIn", "type": "uint16" },
      { "internalType": "uint16", "name": "caloriesOut", "type": "uint16" },
      { "internalType": "string", "name": "note", "type": "string" }
    ],
    "name": "addEntry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
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


export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [f, setF] = useState({ weightKg:"", steps:"", caloriesIn:"", caloriesOut:"", note:"" });

  const connect = async () => {
    if (!window.ethereum) return alert("Установи MetaMask");
    const p = new ethers.providers.Web3Provider(window.ethereum);
    await p.send("eth_requestAccounts", []);
    const { chainId } = await p.getNetwork();
    if (chainId !== EXPECTED_CHAIN_ID) return alert("Переключись на Base");
    const s = p.getSigner();
    const ct = new ethers.Contract(contractAddress, abi, s);
    setContract(ct);
    setAccount((await p.listAccounts())[0]);
    const e = await ct.getMyEntries();
    setEntries(e);
  };

  const submit = async () => {
    if (!contract) return alert("Сначала подключись");
    const tx = await contract.addEntry(
      +f.weightKg, +f.steps, +f.caloriesIn, +f.caloriesOut, f.note
    );
    await tx.wait();
    const e = await contract.getMyEntries();
    setEntries(e);
    setF({ weightKg:"", steps:"", caloriesIn:"", caloriesOut:"", note:"" });
  };

  return (
    <div style={{maxWidth:600,margin:"40px auto",fontFamily:"sans-serif"}}>
      <h1>Weight Loss Diary</h1>
      {!account ?
        <button onClick={connect}>Подключить MetaMask</button> :
        <div>Подключено: {account}</div>
      }
      {account && <>
        {["weightKg","steps","caloriesIn","caloriesOut"].map(k => (
          <div key={k}><input
            type="number"
            name={k}
            placeholder={k}
            value={f[k]}
            onChange={e=>setF({...f,[k]:e.target.value})}
          /></div>
        ))}
        <div><textarea
          name="note"
          placeholder="note"
          value={f.note}
          onChange={e=>setF({...f,note:e.target.value})}
        /></div>
        <button onClick={submit}>Добавить запись</button>
        <h2>Мои записи:</h2>
        <ul>
          {entries.map((e,i)=><li key={i}>
            {new Date(e.timestamp*1000).toLocaleDateString()}: {e.weightKg}kg, {e.steps} шагов, калории {e.caloriesIn}/{e.caloriesOut}, note: {e.note}
          </li>)}
        </ul>
      </>}
    </div>
  )
}
