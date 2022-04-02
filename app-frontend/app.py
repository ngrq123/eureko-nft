import json
import os
from dotenv import load_dotenv

import streamlit as st
from web3.auto.gethdev import w3
from web3 import Web3, IPCProvider
from web3.middleware import geth_poa_middleware

load_dotenv()
PRIVATE_KEY=os.getenv('PRIVATE_KEY')
PUBLIC_KEY=os.getenv('PUBLIC_KEY')
CONTRACT_ADDRESS=os.getenv('CONTRACT_ADDRESS')
ABI_JSON=os.getenv('ABI_JSON')

w3 = Web3(Web3.HTTPProvider('https://eth-rinkeby.alchemyapi.io/v2/1QFGnc3guOeSJ7PcxZmM-Xn68HwjYdu5'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

abi = json.loads(ABI_JSON)
print(abi)

nftContract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

def mint(from_address, token_id):
  nonce = w3.eth.get_transaction_count(from_address, 'latest')

  txn = nftContract.functions.mint(from_address, token_id).buildTransaction({
    'nonce': nonce,
    'gas': 500000
  })
  
  signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
  w3.eth.send_raw_transaction(signed_txn.rawTransaction)


def redeem(from_address, token_id):
  nonce = w3.eth.get_transaction_count(PUBLIC_KEY, 'latest')

  txn = nftContract.functions.redeem(from_address, token_id).buildTransaction({
    'nonce': nonce,
    'gas': 500000
  })
  
  signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
  w3.eth.send_raw_transaction(signed_txn.rawTransaction)

# Dropdown box
selected_function = st.sidebar.selectbox('Select Function', 
                                      options=[
                                          'Mint',
                                          'Redeem'
                                      ], 
                                      help='Select what you want to do')

# Text box
from_address = st.sidebar.text_input('Enter Wallet Address')

if selected_function == 'Mint':
  st.button('Mint NFT', on_click=mint, args=(from_address, 13))

if selected_function == 'Redeem':
  st.button('Redeem NFT', on_click=redeem, args=(from_address, 13))