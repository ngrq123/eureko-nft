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
  const [feedback, setFeedback] = useState("Come and join Eureko!");
  const [claimingNft, setClaimingNFT] = useState(false);
  const [redeemingNFT, setRedeemingNFT] = useState(false);
  const urlimage = "./img/logo.png"
  const mintCounter = 24
  const redeemCounter = 24

  const claimNFTs = (_amount) => {

    setClaimingNFT(true);
    blockchain.smartContract.methods.mint(blockchain.account, mintCounter++).send({

      from: blockchain.account

    }).once("error", (err) => {
      console.log(err);
      setFeedback("Error");
      setClaimingNFT(false);

    }).then((receipt) => {
      setFeedback("You have succesfully minted a NFT");
      setClaimingNFT(false);
    });

  };
  const redeemNFTs = (_amount) => {

    setRedeemingNFT(true);
    blockchain.smartContract.methods.redeem(blockchain.account, redeemCounter++).send({

      from: blockchain.account

    }).once("error", (err) => {
      console.log(err);
      setFeedback("Error");
      setRedeemingNFT(false);

    }).then((receipt) => {
      setFeedback("You have succesfully redeemed a NFT");
      setRedeemingNFT(false);
    });

  };


  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  return (
    <s.Screen
      style = {{ backgroundImage: `url("https://commonthings.s3.ap-southeast-1.amazonaws.com/images/background.png")`,
                backgroundSize: 1320
              }}
    >

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
          style={{ padding: 24, backgroundImage: `url(${urlimage})`}}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome Onboard to Eureko!
          </s.TextTitle>
          <s.SpacerXSmall />
          <img
            src="https://commonthings.s3.ap-southeast-1.amazonaws.com/images/logo.png"
            alt="new"
            width="200"
            height="200"
          />
          <s.TextTitle style={{ textAlign: "center" }}>
            Bridging Brands to Consumers :D
          </s.TextTitle>
          <s.SpacerXSmall />
          <s.TextDescription style={{ textAlign: "center" }}>
            {feedback}
          </s.TextDescription>
          <s.SpacerSmall />

          <s.SpacerSmall />
          <StyledButton
            disabled = {claimingNft ? 1 : 0}
            onClick={(e) => {
              e.preventDefault();
              claimNFTs(1);
            }}
          >
            {claimingNft ? "Busy Minting Bzzz Bzzz" : "Mint your Eureko NFT Today "}

          </StyledButton>
          <s.SpacerSmall />

          <s.SpacerSmall />
          <StyledButton
            disabled = {redeemingNFT ? 1 : 0}
            onClick={(e) => {
              e.preventDefault();
              redeemNFTs(1);
            }}
          >
            {claimingNft ? "Busy Redeeming" : "Redeem 1 " + data.name }

          </StyledButton>
          <s.SpacerSmall />


        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
