import json
import math
import os

import cv2
from flask import Flask
from flask import jsonify
import numpy as np
import requests

app = Flask(__name__)

@app.route('/health')
def health():
    res = dict()
    res['status'] = 'available'

    return jsonify(res)


@app.route('/process/<path:token_hash>')
def process_nft(token_hash: str):
    IPFS_URL = os.getenv('IPFS_URL')
    res = requests.get(IPFS_URL + token_hash)
    res = json.loads(res.content)
    attributes = res['attributes']

    # Convert attributes to dict {trait_type: value}
    attributes_dict = dict()
    for obj in attributes:
        key, value = obj["trait_type"], obj["value"]
        attributes_dict[key] = value

    # Loop through and process NFT
    num_portions = attributes_dict['Number of Portions']
    # Initialise URLs
    urls = list()

    for idx in range(num_portions):
        # Check state
        is_scratched = attributes_dict['Portion ' + str(idx+1) + ' Scratched']
        if (is_scratched):
            # TODO: Update URL
            # attributes_dict['Portion ' + str(idx+1) + ' URL']
            pass
        # Get image URL
        urls.append(attributes_dict['Portion ' + str(idx+1) + ' URL'])

    images = [load_image(url) for url in urls]
    nft = generate_nft(images)

    # TODO: Upload NFT and update image and external URL
    
    return jsonify(res)


def load_image(url):
    img = requests.get(url).content
    # https://stackoverflow.com/a/49517948
    img = cv2.imdecode(np.frombuffer(img, np.uint8), -1)
    return img


def generate_nft(images):
    nrow = math.ceil(math.sqrt(len(images)))
    img_idx = 0
    nft = np.zeros((0, images[0].shape[1] * nrow, images[0].shape[2]), dtype=np.uint8)
    
    for _ in range(nrow):
        if img_idx < len(images):
            row_img = images[img_idx]
            img_idx = img_idx + 1
            for _ in range(nrow-1):
                if img_idx < len(images):
                    row_img = cv2.hconcat([row_img, images[img_idx]])
                    img_idx = img_idx + 1
            y_diff = nft.shape[1] - row_img.shape[1]
            if y_diff > 0:
                row_img = cv2.hconcat([row_img, 255 * np.ones((row_img.shape[0], y_diff, images[0].shape[2]), 
                                       dtype=np.uint8)])
            nft = cv2.vconcat([nft, row_img])
    
    return nft