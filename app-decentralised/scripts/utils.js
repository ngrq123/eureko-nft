require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/EurekoNFT.sol/EurekoNFT.json")

const contractAddress = process.env.CONTRACT_ADDRESS
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

async function showOwner() {
  nftContract.methods.owner()
    .call(function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
}

async function showRelease() {
  nftContract.methods.release()
    .call(function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
}

async function showTokenURI() {
  nftContract.methods.tokenURI(1)
    .call(function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
}

showOwner();
showRelease();
showTokenURI();