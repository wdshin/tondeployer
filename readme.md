## Ton Deployer

Node script to deploy build and deploy ton contracts.

## How to run
1. Place your *contract.fc* file to *contracts* folder
2. run **npx func-js contracts/contract.fc --boc cells/contract.cell** to compile FunC contract to BoC
3. <sub>[Optional]</sub> Put your mnemonic key to *mnemonics/deployKey.txt*
4. run **npx ts-node deploy.ts** and follow instructions
