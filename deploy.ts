import * as fs from "fs";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, Cell, WalletContractV3R2, WalletContractV4 } from "ton";
import { createInterface } from "readline";
import TonContract from "./TonContract";

function delay(ms: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (question: string) =>
  new Promise((resolve) => rl.question(question, resolve));


async function deploy() {

  const useMainnetPrompt = await question("Use mainnet? y/n: ") as string;
  const useMainnet = useMainnetPrompt.toLowerCase() == 'y';
  console.log("Using " + useMainnet ? "mainnet" : "testnet");

  // create ton client
  const endpoint = await getHttpEndpoint({ network: useMainnet ? "mainnet" : "testnet" });
  const client = new TonClient({ endpoint });

  console.log("Reading contract BoC")
  const contractCode = Cell.fromBoc(fs.readFileSync("cells/contract.cell"))[0];
  const initValue = Date.now(); // to avoid collisions use current number of milliseconds since epoch as initial value
  const contract = TonContract.createForDeploy(contractCode, initValue);

  // exit if contract is already deployed
  console.log("New contract address:", contract.address.toString());
  if (await client.isContractDeployed(contract.address)) {
    return console.log("Contract already deployed, set another init state");
  }

  let mnemonic: string = "";
  if (fs.existsSync("mnemonics/deployKey.txt")) {
    console.log("Reading DeployKey mnemonic from 'mnemonics/deployKey.txt'")
    mnemonic = fs.readFileSync("mnemonics/deployKey.txt").toString();
  } else {
    mnemonic = await question("DeployKey not found, enter your wallet mnemonic: ") as string;
  }

  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const walletClass = useMainnet ? WalletContractV4 : WalletContractV3R2; // mainnet uses v4 wallet, while test net v3r2
  const wallet = walletClass.create({ publicKey: key.publicKey, workchain: 0 });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("This wallet is not deployed");
  }

  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  console.log("Deploying contract on blockchain")
  const counterContract = client.open(contract);
  await counterContract.sendDeploy(walletSender);

  // wait until confirmed
  let currentSeqno = seqno;

  console.log("Waiting 5s to confirm transaction...");
  await delay(5000);
  while (currentSeqno == seqno) {
    await delay(1000);
    console.log("still waiting...");
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("Contract successfully deployed!");

  rl.close();
}

deploy();

