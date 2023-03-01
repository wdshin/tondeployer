## Ton Deployer

Node script to deploy build and deploy ton contracts.

## Directories

* `contracts/` - Contract FunC sources
* `cells/` - Compiled contract BoC's
* `mnemonics/` - Mnemonic phrase of your wallet, to deploy contract with

## How to run

1. Place your *contract.fc* file to *contracts* folder
2. Run `npx func-js contracts/contract.fc --boc cells/contract.cell` to compile FunC contract to BoC
3. Put your mnemonic key to *mnemonics/deployKey.txt* [Optional]
4. Run `npx ts-node deploy.ts` to deploy contract
5. Run `npx ts-node withdraw.ts` to withdraw funds from contract
