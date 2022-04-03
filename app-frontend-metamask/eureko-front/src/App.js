import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";


export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [feedback, setFeedback] = useState("Maybe it's your lucky day!");
  const [claimingNft, setClaimingNFT] = useState(false);
  const [redeemingNFT, setRedeemingNFT] = useState(false);


  const claimNFTs = (_amount) => {

    setClaimingNFT(true);
    blockchain.smartContract.methods.whatever(blockchain.account,21)
    .once("error", (err) => {
      console.log(err);
      setFeedback("Error");
      setClaimingNFT(false);

    }).then((receipt) => {
      setFeedback("You have succesfully minted a NFT");
      setClaimingNFT(false);
    });

  };
/*
  const redeemingNFTs = (_amount) => {

    setClaimingNFT(true);
    blockchain.smartContract.methods.redeem(blockchain.account,21)
    .once("error", (err) => {
      console.log(err);
      setFeedback("Error");
      setRedeemingNFT(false);

    }).then((receipt) => {
      setFeedback("You have succesfully redeemed a NFT");
      setRedeemingNFT(false);
    });

  };

*/


  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  return (
    <s.Screen>
      {blockchain.account === "" || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={"center"} jc={"center"} style={{ padding: 24, background:"pink" }}>
          <s.TextTitle>Connect your Wallet</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container
          flex={1}
          ai={"center"}
          jc="center"
          style={{ padding: 24, background:"pink" }}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Hey there!
          </s.TextTitle>
          <s.SpacerXSmall />
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome to Randomize by Random!
          </s.TextTitle>
          <s.SpacerXSmall />
          <s.TextDescription style={{ textAlign: "center" }}>
            {feedback}
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription style={{ textAlign: "center" }}>
            {data.name}
          </s.TextDescription>
          <s.SpacerSmall />
          <StyledButton
            disabled = {claimingNft ? 1 : 0}
            onClick={(e) => {
              e.preventDefault();
              setClaimingNFT(1);
            }}
          >
            {claimingNft ? "Busy Claiming" : "Claim 1 " + data.name }




        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
