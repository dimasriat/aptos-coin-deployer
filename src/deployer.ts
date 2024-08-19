import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { exec } from "child_process";

function execPromise(command: string): Promise<void> {
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

function generateModuleAccount(): ModuleAccount {
  const moduleAccount = Ed25519Account.generate();
  const address = moduleAccount.accountAddress.toString();
  const privateKey = moduleAccount.privateKey.toString();

  const auth: ModuleAccount = { address, privateKey };

  console.log(auth);

  return auth;
}

async function initializeModuleAccount(privateKey: string) {
  const initCommand = `aptos init \\\n --network devnet --private-key ${privateKey} --assume-yes \n`;
  await execPromise(initCommand);
}

async function publishModule(address: string) {
  const publishCommand = `aptos move publish \\\n --package-dir src/move --named-addresses MyApp=${address} \\\n --skip-fetch-latest-git-deps --assume-yes \n`;
  await execPromise(publishCommand);
}

async function main() {
  const { address, privateKey } = generateModuleAccount();
  await initializeModuleAccount(privateKey);
  await publishModule(address);
}

main();
