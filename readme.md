## Ton Deployer

Node script to deploy build and deploy ton contracts.

## Directories

* `contracts/` - Contract FunC sources
* `cells/` - Compiled contract BoC's
* `mnemonics/` - Mnemonic phrase of your wallet, to deploy contract with

## How to run

1. Place your *contract.fc* file to *contracts* folder
2. run `npx func-js contracts/contract.fc --boc cells/contract.cell` to compile FunC contract to BoC
3. Put your mnemonic key to *mnemonics/deployKey.txt* [Optional]
4. run 'npx ts-node deploy.ts' and follow instructions
