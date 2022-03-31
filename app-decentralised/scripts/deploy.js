const OWNER_ADDRESS = process.env.PUBLIC_KEY;

async function main() {
  const EurekoNFT = await ethers.getContractFactory("EurekoNFT")

  // Start deployment, returning a promise that resolves to a contract object
  const eurekoNFT = await EurekoNFT.deploy(OWNER_ADDRESS) // https://ethereum.stackexchange.com/a/30766
  await eurekoNFT.deployed()
  console.log("Contract deployed to address:", eurekoNFT.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
