import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";

const EXPECTED_CHAIN_ID = 8453;
const contractAddress = "0xDe65B2b24558Ef18B923D31E9E6be966b9e3b0Bd";

const abi = [ /* сокращён ради читаемости, тот же, как выше */ ];

export default function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: ""
  });

  const connect = async () => {
    try {
      if (!window.ethereum) return alert("Установите MetaMask");
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        return alert("Переключитесь на сеть Base (Chain ID 8453)");
      }

      const signer = await provider.getSigner();
      const ct = new Contract(contractAddress, abi, signer);
      const accounts = await provider.listAccounts();
      const user = accounts[0];

      const all = await ct.getMyEntries();
      setAccount(user);
      setContract(ct);
      setEntries(all);
    } catch (err) {
      console.error(err);
      alert("Ошибка при подключении");
    }
  };

  const submit = async () => {
    if (!contract) return;
    const { weightKg, steps, caloriesIn, caloriesOut, note } = form;

    try {
      const tx = await contract.addEntry(
        Number(weightKg),
        Number(steps),
        Number(caloriesIn),
        Number(caloriesOut),
        note
      );
      await tx.wait();
      const updated = await contract.getMyEntries();
      setEntries(updated);
      setForm({ weightKg: "", steps: "", caloriesIn: "", caloriesOut: "", note: "" });
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении записи");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial" }}>
      <h1>Weight Loss Diary</h1>

      {!account ? (
        <button onClick={connect}>Подключить MetaMask</button>
      ) : (
        <p>Вы вошли как: {account}</p>
      )}

      {account && (
        <>
          {["weightKg", "steps", "caloriesIn", "caloriesOut"].map((key) => (
            <input
              key={key}
              type="number"
              placeholder={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={{ display: "block", marginBottom: "8px" }}
            />
          ))}
          <textarea
            placeholder="Заметка"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            style={{ width: "100%", height: "60px", marginBottom: "10px" }}
          />
          <button onClick={submit}>Добавить</button>

          <h2 style={{ marginTop: "2rem" }}>Ваши записи</h2>
          <ul>
            {entries.map((e, i) => (
              <li key={i}>
                {new Date(Number(e.timestamp) * 1000).toLocaleDateString()}: {e.weightKg} кг, {e.steps} шагов, калории {e.caloriesIn}/{e.caloriesOut}, заметка: {e.note}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
