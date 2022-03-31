//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EurekoNFT is ERC721, Ownable {
    mapping(uint256 => string) private _tokenURIs; // Token id to token URI
    string private defaultURI = ""; 

    bool public isReleased; 

    constructor() ERC721("EurekoNFT", "ERK") { }

    function mint(address recipient, uint256 tokenId, string memory uri)
        returns (uint256)
    {
        require(isReleased, "COLLECTION_NOT_RELEASED");
        require(!_exists(tokenId), "TOKEN_MINTED");
        require(_tokenURIs[tokenId] != "", "TOKEN_NOT_FOUND");
        
        _safeMint(recipient, tokenId);
        return tokenId; // Need to return id?
    }
    
    function toggleRelease() external onlyOwner {
        // Release/Lock NFT collection for minting
        isReleased = !isReleased;
    }

    function setTokenURI(uint256 tokenId, string calldata uri) external onlyOwner {
        _tokenURIs[tokenId] = uri;
    } 

    function tokenURI(uint256 tokenId) public view override(ERC721)
        returns (string memory)
    {
        require(_exists(tokenId), "TOKEN_NOT_EXISTS");
        return string(abi.encodePacked(_tokenURIs[tokenId]));
    }
    
}
