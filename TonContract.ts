import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell } from "ton-core";

export default class TonContract implements Contract {

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) { }

  static createForDeploy(code: Cell, initialCounterValue: number): TonContract {

    const data = beginCell()
      .storeUint(initialCounterValue, 64)
      .endCell();
    const workchain = 0
    const address = contractAddress(workchain, { code, data });
    return new TonContract(address, { code, data });
  }

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.01", // send 0.01 TON for deploy
      bounce: false  // dont bounce, it's contract init
    });
  }

  async sendWithdraw(provider: ContractProvider, via: Sender) {
    const messageBody = beginCell()
      .storeUint(888444, 32) // op #888444 = withdraw
      .endCell();
    await provider.internal(via, {
      value: "0.1",
      body: messageBody
    });
  }

}