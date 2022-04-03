from dotenv import load_dotenv
import json
import os
import time

import requests
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

nftContract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

def mint(from_address, token_id):
  if len(from_address) == 0:
    st.error('Please enter your wallet address in the sidebar')
    return

  nonce = w3.eth.get_transaction_count(PUBLIC_KEY, 'latest')

  txn = nftContract.functions.mint(from_address, token_id).buildTransaction({
    'nonce': nonce,
    'gas': 500000
  })
  
  signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
  w3.eth.send_raw_transaction(signed_txn.rawTransaction)
  st.info('The hash of your transaction is: ' + signed_txn.hash.hex())

  for _ in range(12):
    try:
      res = w3.eth.get_transaction_receipt(signed_txn.hash.hex())
      while 'status' not in res:
        time.sleep(5)
        res = w3.eth.get_transaction_receipt(signed_txn.hash.hex())

      status = res['status']

      if status == 1:
        st.success('Transaction successful')
        break
      else:
        st.error('Transaction failed')
        break
    except:
      time.sleep(5)
      continue


def redeem(from_address, token_id):
  if len(from_address) == 0:
    st.error('Please enter your wallet address in the sidebar')
    return
  
  nonce = w3.eth.get_transaction_count(PUBLIC_KEY, 'latest')

  txn = nftContract.functions.redeem(from_address, token_id).buildTransaction({
    'nonce': nonce,
    'gas': 500000
  })
  
  signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
  w3.eth.send_raw_transaction(signed_txn.rawTransaction)
  st.info('The hash of your transaction is: ' + signed_txn.hash.hex())

  for _ in range(12):
    try:
      res = w3.eth.get_transaction_receipt(signed_txn.hash.hex())
      while 'status' not in res:
        time.sleep(5)
        res = w3.eth.get_transaction_receipt(signed_txn.hash.hex())

      status = res['status']

      if status == 1:
        st.success('Transaction successful')
        break
      else:
        st.error('Transaction failed')
        break
    except:
      time.sleep(5)
      continue

# Dropdown box
selected_function = st.sidebar.selectbox('Select Function', 
                                      options=[
                                          'Mint',
                                          'Redeem'
                                      ], 
                                      help='Select what you want to do')

# Text box
from_address = st.sidebar.text_input('Enter Wallet Address')

# Number input box
token_id = st.sidebar.number_input('Enter token id', min_value=1, step=1)

st.title('Eureko')

if selected_function == 'Mint':
  st.image('./images/token_unrevealed.png')
  st.button('Mint NFT', on_click=mint, args=(from_address, token_id))

if selected_function == 'Redeem':
  try:
    metadata_url = nftContract.functions.tokenURI(16).call()
    res = requests.get(metadata_url).json()
    st.image(res['image'])
    st.button('Redeem NFT', on_click=redeem, args=(from_address, token_id))
  except:
    st.error('Token not exists - token is not in circulation')
