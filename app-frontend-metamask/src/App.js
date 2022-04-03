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
  const [redeemFeedback, setRedeemFeedback] = useState("Please input your NFT ID");
  const [claimingNft, setClaimingNFT] = useState(false);
  const [redeemingNFT, setRedeemingNFT] = useState(false);
  const urlimage = "./img/logo.png"
  const [redeemdata,setData] = useState (null)
  const mintCounter = 1
  const redeemCounter = 1

  function getData (val)
  {

    setData(val.target.value)
  }


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

    if(!redeemdata){
      setRedeemFeedback("Error! Please put in the right ID");
      setRedeemingNFT(false);
      return
    }

    setRedeemingNFT(true);
    blockchain.smartContract.methods.redeem(blockchain.account, redeemdata).send({

      from: blockchain.account

    }).once("error", (err) => {
      console.log(err);
      setRedeemFeedback("Error Please put in the right ID");
      setRedeemingNFT(false);

    }).then((receipt) => {
      setRedeemFeedback("You have succesfully redeemed a NFT");
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
          <s.SpacerXSmall />

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
          <s.TextDescription style={{ textAlign: "center" }}>
            {"Redeem Your Revealed NFT Today!"}
          </s.TextDescription>
          <s.TextDescription style={{ textAlign: "center" }}>
            {redeemFeedback}
          </s.TextDescription>
          <input type = "text" onChange = {getData}/>
          <s.SpacerSmall />
          <StyledButton
            disabled = {redeemingNFT ? 1 : 0}
            onClick={(e) => {
              e.preventDefault();
              redeemNFTs(1);
            }}
          >
            {redeemingNFT ? "Busy Redeeming" : "Redeem your " + data.name }

          </StyledButton>
          <s.SpacerSmall />


        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
