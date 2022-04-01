require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/EurekoNFT.sol/EurekoNFT.json")

const contractAddress = null // TODO: Add contract address
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

async function redeemNFT(fromAddress, tokenId) {
  const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest'); // Get latest nonce

  // Transaction
  const tx = {
    'from': fromAddress,
    'to': "0x0000000000000000000000000000000000000000",
    'nonce': nonce,
    'gas': 500000,
    'data': nftContract.methods.redeem(fromAddress, tokenId).encodeABI()
  };

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    });
}

redeemNFT(PUBLIC_KEY, 1);