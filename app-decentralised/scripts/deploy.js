async function main() {
  const EurekoNFT = await ethers.getContractFactory("EurekoNFT")

  // Start deployment, returning a promise that resolves to a contract object
  const eurekoNFT = await EurekoNFT.deploy()
  await eurekoNFT.deployed()
  console.log("Contract deployed to address:", eurekoNFT.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
