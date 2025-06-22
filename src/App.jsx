import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";

const EXPECTED_CHAIN_ID = 8453;
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

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
  const [form, setForm] = useState({
    weightKg: "",
    steps: "",
    caloriesIn: "",
    caloriesOut: "",
    note: ""
  });

  const connect = async () => {
    try {
      if (!window.ethereum) return alert("Установите MetaMask");

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (chainId !== EXPECTED_CHAIN_ID) {
        return alert("Переключитесь на сеть Base (Chain ID 8453)");
      }

      const signer = await provider.getSigner();
      const ct = new Contract(contractAddress, abi, signer);
      const accs = await provider.listAccounts();

      setAccount(accs[0]);
      setContract(ct);

      const all = await ct.getMyEntries();
      setEntries(all);
    } catch (err) {
      console.error("Ошибка при подключении:", err);
      alert("Ошибка при подключении к MetaMask");
    }
  };

  const submit = async () => {
    if (!contract) return alert("Сначала подключитесь к MetaMask");
    const { weightKg, steps, caloriesIn, caloriesOut, note } = form;

    try {
      const tx = await contract.addEntry(
        parseInt(weightKg),
        parseInt(steps),
        parseInt(caloriesIn),
        parseInt(caloriesOut),
        note
      );
      await tx.wait();
      const updated = await contract.getMyEntries();
      setEntries(updated);
      setForm({ weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: "" });
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err);
      alert("Ошибка при добавлении записи");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Weight Loss Diary</h1>

      {!account ? (
        <button onClick={connect}>Подключить MetaMask</button>
      ) : (
        <p>Подключено: {account}</p>
      )}

      {account && (
        <>
          {["weightKg", "steps", "caloriesIn", "caloriesOut"].map((key) => (
            <div key={key}>
              <input
                type="number"
                name={key}
                placeholder={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <textarea
              name="note"
              placeholder="Заметка"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <button onClick={submit}>Добавить запись</button>

          <h2>Ваши записи</h2>
          <ul>
            {entries.map((e, i) => (
              <li key={i}>
                {new Date(e.timestamp * 1000).toLocaleDateString()}: {e.weightKg} кг, {e.steps} шагов, калории {e.caloriesIn}/{e.caloriesOut}, заметка: {e.note}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
