const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
const mnemonicInfo = require('./config.json')


const provider = new HDWalletProvider(
  // 'REPLACE_WITH_YOUR_MNEMONIC',
  mnemonicInfo['metamaskMnemonic'],
  "https://rinkeby.infura.io/v3/7d6907ac88884292876bc0495740870d"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log("ABI: ",interface)
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
