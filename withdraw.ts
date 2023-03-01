import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, Address, WalletContractV3R2 } from "ton";
import { createInterface } from "readline";
import * as fs from "fs";
import TonContract from "./TonContract";

const donationContractAddress = "EQAKOF-lITE_xjF8WNuXtV6I9B3vOGEgvEdc2YX9cojyidlZ";

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

const question = (question: string) =>
	new Promise((resolve) => rl.question(question, resolve));


async function main() {

	console.clear();

	const useMainnetPrompt = await question("Use mainnet? y/n: ") as string;
	const useMainnet = useMainnetPrompt.toLowerCase() == 'y';
	console.log("Using " + (useMainnet ? "mainnet" : "testnet"));

	const endpoint = await getHttpEndpoint({ network: useMainnet ? "mainnet" : "testnet" });
	const client = new TonClient({ endpoint });

	let mnemonic: string = "";
	if (fs.existsSync("mnemonics/deployKey.txt")) {
		console.log("Reading DeployKey from 'mnemonics/deployKey.txt'")
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

	const contractAddress = Address.parse(donationContractAddress);
	const contract = new TonContract(contractAddress);
	const donationContract = client.open(contract);

	console.log("Sending withdraw transaction")
	await donationContract.sendWithdraw(walletSender);

	// wait until confirmed
	let currentSeqno = seqno;

	console.log("Waiting 5s to confirm transaction...");
	await delay(5000);
	while (currentSeqno == seqno) {
		await delay(1000);
		console.log("still waiting...");
		currentSeqno = await walletContract.getSeqno();
	}
	console.log("Funds successfully withdrawed 🤑");
}

main();

function delay(ms: number = 1000) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/*

npx ts-node withdraw.ts

*/