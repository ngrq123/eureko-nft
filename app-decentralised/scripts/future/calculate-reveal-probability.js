const happyHourBonus = 0.2;

async function isEligibleTransaction(salePrice, mintPrice, pastOwners) {
  if (salePrice < mintPrice) {
    return false;
  }

  for (const pastOwner in pastOwners) {
    if (recipient == pastOwner) {
      return false;
    }
  }

  return true;
}

async function calculatePercDiff(salePrice, mintPrice) {
  return (salePrice - mintPrice) / mintPrice;
}

async function calculatePropTransactionSinceStateChange(pastXStates) {
  // Calculate num txns since last reveal (state change)
  const x = pastXStates.length
  let currPerc = pastStates[0]['Percentage Scratched'];
  let numTxnsSinceStateChange = 0;

  for (const pastState in pastStates.slice(1)) {
    let pastPerc = pastState['PercentageScratched'];
    if (pastPerc == currPerc) {
      numTxnsSinceStateChange = numTxnsSinceStateChange + 1;
    } else {
      // State is different
      return numTxnsSinceStateChange / x;
    }
  }

  return numTxnsSinceStateChange / x;
}

async function calculatePropDuration(txnDate, startDate, endDate) {
  const daysSinceStart = Math.ceil((txnDate - startDate) / (1000 * 60 * 60 * 24))
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  return daysSinceStart / totalDays;
}

async function calculateRevealProbability(pricePercDiff, propTransactionSinceStateChange, propDuration, isHappyHour) {
  let h = 1;
  if (isHappyHour) {
    h = h + happyHourBonus;
  }

  const q = Math.min(Math.random() + 0.0001, 1)  // Prevent 0 and keep max as 1

  return h * q * (pricePercDiff + propTransactionSinceStateChange + propDuration);
}
