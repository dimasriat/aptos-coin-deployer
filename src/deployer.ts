import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";

import { exec } from "child_process";

function execPromise(commandList: string[]): Promise<void> {
  const command = commandList.join(" \\\n ");
  console.log("executing:\n", command);
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        console.error(err);
        reject();
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      resolve();
    });
  });
}

type ModuleAccount = {
  address: string;
  privateKey: string;
};

async function generateModuleAccount(): Promise<ModuleAccount> {
  const moduleAccount = Ed25519Account.generate();
  const address = moduleAccount.accountAddress.toString();
  const privateKey = moduleAccount.privateKey.toString();

  await aptos.fundAccount({
    accountAddress: moduleAccount.accountAddress,
    amount: 100_000_000,
  });

  const auth: ModuleAccount = { address, privateKey };

  console.log(auth);

  return auth;
}

async function initializeModuleAccount(privateKey: string) {
  await execPromise([
    "aptos init",
    `--network devnet --private-key ${privateKey} --assume-yes`,
  ]);
}

async function publishModule(address: string) {
  await execPromise([
    "aptos move publish --package-dir src/move",
    "--skip-fetch-latest-git-deps --assume-yes",
    `--named-addresses MyApp=${address}`,
  ]);
}

const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

async function transferCoin(
  moduleAccountPrivateKey: string,
  receiverAddress: string,
  amount: number,
) {
  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(moduleAccountPrivateKey),
  });

  const txn = await aptos.transaction.build.simple({
    sender: signer.accountAddress,
    data: {
      function: `${signer.accountAddress}::my_coin::transfer`,
      functionArguments: [receiverAddress, amount],
    },
  });

  const commitedTxn = await aptos.signAndSubmitTransaction({
    signer: signer,
    transaction: txn,
  });

  const executedTransaction = await aptos.waitForTransaction({
    transactionHash: commitedTxn.hash,
  });

  console.log(JSON.stringify(executedTransaction, null, 2));
  console.log("Transaction executed:", executedTransaction.hash);
}

async function registerCoin(
  privateKey: string,
  coinTypeAddress: string,
) {
  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKey),
  });

  const txn = await aptos.transaction.build.simple({
    sender: signer.accountAddress,
    data: {
      function: `${coinTypeAddress}::my_coin::register`,
      functionArguments: [],
    },
  });

  const commitedTxn = await aptos.signAndSubmitTransaction({
    signer: signer,
    transaction: txn,
  });

  const executedTransaction = await aptos.waitForTransaction({
    transactionHash: commitedTxn.hash,
  });

  console.log(JSON.stringify(executedTransaction, null, 2));
  console.log("Transaction executed:", executedTransaction.hash);
}

async function main() {
  const { address, privateKey } = await generateModuleAccount();
  const { address: receiverAddress, privateKey: receiverPrivateKey } = await generateModuleAccount();
  await initializeModuleAccount(privateKey);
  await publishModule(address);

  await registerCoin(receiverPrivateKey, address);

  await transferCoin(privateKey, receiverAddress, 10_000_000);

  console.log({ moduleAddress: address, receiverAddress });
}

main();
