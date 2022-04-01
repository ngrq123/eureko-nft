import io
import json
import math
import os
import secrets

import botocore
import boto3
import cv2
from flask import Flask
from flask import jsonify
from flask import request
import numpy as np
import psycopg2
import requests

DATABASE_URL = os.environ['DATABASE_URL']
S3_BUCKET = os.environ['S3_BUCKET']
S3_METADATA_FOLDER = os.environ['S3_METADATA_FOLDER']
S3_NFT_FOLDER = os.environ['S3_NFT_FOLDER']
S3_BASE_URL = os.environ['S3_BASE_URL']

app = Flask(__name__)

@app.route('/health')
def health():
    res = dict()
    res['status'] = 'available'

    return jsonify(res)

@app.route('/create/<int:token_id>')
def create_nft(token_id: int):

    query = f"""
        SELECT *
        FROM token
        WHERE id = {token_id}
        ;
    """
    res = execute_query(query)

    if len(res) == 0:
        return jsonify({
            'error': "TOKEN_ID_NOT_EXISTS"
        })
    
    # Test data
    # res = [
    #     (1, 1, 'Scratch Card', 'A tier 1 scratch card token', 0.01, 'http://example.com', 'http://example.com'),
    #     (1, 2, 'Scratch Card', 'A tier 1 scratch card token', 0.01, 'http://example.com', 'http://example.com')
    # ]

    token_metadata = dict()

    images = [load_image(row[5]) for row in res]
    nft = generate_nft(images)

    token_metadata['image'] = upload_nft(nft, token_id)

    if len(token_metadata['image']) == 0:
        return jsonify({
            'error': 'NFT_UPLOAD_FAILED'
        })

    token_metadata['name'] = res[0][2]
    token_metadata['description'] = res[0][3]

    token_metadata['attributes'] = list()
    token_metadata['attributes'].append(generate_attribute('Number of Portions', len(res), 'boost_number'))
    token_metadata['attributes'].append(generate_attribute('Percentage Scratched', 0.0, 'boost_precentage'))
    token_metadata['attributes'].append(generate_attribute('Recommended Mint Price (ETH)', res[0][4]))

    for idx in range(len(res)):
        token_metadata['attributes'].append(generate_attribute('Portion ' + str(idx+1) + ' Scratched', False))

    for idx in range(len(res)):
        token_metadata['attributes'].append(generate_attribute('Portion ' + str(idx+1) + ' URL', res[idx][5]))

    metadata_url = upload_metadata(token_metadata, token_id)

    if len(metadata_url) == 0:
        return jsonify({
            'error': 'METADATA_UPLOAD_FAILED'
        })

    
    return jsonify({
        'metadata_url': metadata_url
    })


@app.route('/process/<path:token_id>')
def process_nft(token_id: str):
    query = f"""
        SELECT *
        FROM token
        WHERE id = {token_id}
        ;
    """
    res = execute_query(query)

    if len(res) == 0:
        return jsonify({
            'error': "TOKEN_ID_NOT_EXISTS"
        })
    
    request_dict = request.get_json(force=True)
    metadata_url = request_dict['metadata_url']
    res = requests.get(metadata_url)
    res = json.loads(res.content)
    attributes = res['attributes']

    # Convert attributes to dict {trait_type: value}
    attributes_dict = dict()
    for obj in attributes:
        key, value = obj["trait_type"], obj["value"]
        attributes_dict[key] = value

    if attributes_dict['Percentage Scratched'] == 100:
        # No more parts to reveal
        return jsonify(res)
    
    # Scratch NFT
    idx_to_scratch = np.random.randint(0, num_portions)
    while (not attributes_dict['Portion ' + str(idx+1) + ' Scratched']):
        idx_to_scratch = np.random.randint(0, num_portions)

    attributes_dict['Portion ' + str(idx_to_scratch+1) + ' Scratched'] = True

    query = f"""
        SELECT url_scratched
        FROM token
        WHERE id = {token_id} AND part_id = {idx_to_scratch+1}
        ;
    """
    res = execute_query(query)
    attributes_dict['Portion ' + str(idx+1) + ' URL'] = res[0][0]

    # Loop through and process NFT
    num_portions = attributes_dict['Number of Portions']
    # Initialise URLs
    urls = list()
    
    for idx in range(num_portions):
        # Get image URL
        urls.append(attributes_dict['Portion ' + str(idx+1) + ' URL'])

    images = [load_image(url) for url in urls]
    nft = generate_nft(images)

    new_nft_url = upload_nft(nft, token_id)

    if len(new_nft_url) == 0:
        return jsonify({
            'error': 'NFT_UPLOAD_FAILED'
        })

    res['image'] = new_nft_url
    metadata_url = upload_metadata(res, token_id)

    if len(metadata_url) == 0:
        return jsonify({
            'error': 'METADATA_UPLOAD_FAILED'
        })

    
    return jsonify({
        'metadata_url': metadata_url
    })


@app.route('/load/<int:token_id>')
def load(token_id: int):
    query = f"""
        SELECT *
        FROM token
        WHERE id = {token_id}
        ;
    """
    res = execute_query(query)

    if len(res) > 0:
        return jsonify({
            'error': "TOKEN_ID_EXISTS"
        })
    
    request_dict = request.get_json(force=True)
    
    if 'name' not in request_dict:
        return jsonify({
            'error': "NAME_NOT_EXISTS"
        })
    
    name = request_dict['name']

    if 'description' not in request_dict:
        return jsonify({
            'error': "DESCRIPTION_NOT_EXISTS"
        })
    
    description = request_dict['description']

    if 'recommended_mint_price' not in request_dict:
        return jsonify({
            'error': "RECOMMENDED_MINT_PRICE_NOT_EXISTS"
        })
    
    recommended_mint_price = request_dict['recommended_mint_price']

    if ('url_unscratched' not in request_dict) or (len(request_dict['url_unscratched']) == 0):
        return jsonify({
            'error': "UNSCRATCHED_URL_NOT_EXISTS"
        })

    if ('url_scratched' not in request_dict) or (len(request_dict['url_scratched']) == 0):
        return jsonify({
            'error': "SCRATCHED_URL_NOT_EXISTS"
        })

    url_unscratched = request_dict['url_unscratched']
    url_scratched = request_dict['url_scratched']

    if len(url_unscratched) != len(url_scratched):
        return jsonify({
            'error': "URL_DIFFERENT_LENGTHS"
        })
    
    query = """
        INSERT INTO token (
            id, 
            part_id, 
            token_name, 
            token_description, 
            token_recommended_mint_price, 
            url_unscratched, 
            url_scratched
        ) VALUES 
    """
    
    values_list = list()
    for idx, (url_hidden, url_unhidden) in enumerate(zip(url_unscratched, url_scratched)):
        values_list.append(f"""
            ({token_id}, {idx+1}, '{name}', '{description}', {recommended_mint_price}, '{url_hidden}', '{url_unhidden}')
        """)
    query += ', '.join(values_list)

    execute_command(query)

    return jsonify({
        'result': 'Added ' + str(token_id) + ' into database'
    })


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

def execute_query(query: str):
    print(query)
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')

    res = None
    with conn.cursor() as curs:
        curs.execute(query)
        res = curs.fetchall()

    conn.commit()
    conn.close()
    return res

def execute_command(query: str):
    print(query)
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')

    with conn.cursor() as curs:
        curs.execute(query)

    conn.commit()
    conn.close()

def generate_attribute(trait_type, value, display_type=None):
    attr_dict = dict()
    
    if display_type:
        attr_dict['display_type'] = display_type

    attr_dict['trait_type'] = trait_type
    attr_dict['value'] = value
    
    return attr_dict

def upload_nft(image, token_id):
    image_bytes = cv2.imencode('.png', image)[1].tobytes()
    file_name = str(token_id) + '_' + secrets.token_hex() + '.png'
    print(file_name)
    # Upload the file
    s3 = boto3.resource('s3')
    try:
        s3.Bucket(S3_BUCKET).upload_fileobj(io.BytesIO(image_bytes), S3_NFT_FOLDER + '/' + file_name)
    except botocore.exceptions.ClientError as e:
        print(e)
        return ""
    return S3_BASE_URL + '/' + S3_NFT_FOLDER + '/' + file_name

def upload_metadata(metadata, token_id):
    metadata = json.dumps(metadata)
    file_name = str(token_id) + '_' + secrets.token_hex() + '.json'
    print(file_name)

    # Upload the file
    s3 = boto3.resource('s3')
    try:
        s3.Bucket(S3_BUCKET).upload_fileobj(io.BytesIO(metadata), S3_METADATA_FOLDER + '/' + file_name)
    except botocore.exceptions.ClientError as e:
        print(e)
        return ""
    return S3_BASE_URL + '/' + S3_METADATA_FOLDER + '/' + file_name