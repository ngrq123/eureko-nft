//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract EurekoNFT is ERC721Enumerable, Ownable, IERC2981 {
    mapping(uint256 => string) private _tokenURIs; // Token id to token URI
    address private _owner;

    bool public isReleased; 

    constructor(
        address owner
    ) ERC721("EurekoNFT", "ERK") {
        _owner = owner;
    }

    function mint(address recipient, uint256 tokenId) public
        returns (uint256)
    {
        require(isReleased, "COLLECTION_NOT_RELEASED");
        require(bytes(_tokenURIs[tokenId]).length > 0, "TOKEN_NOT_FOUND");
        require(_exists(tokenId), "TOKEN_MINTED");
        
        _safeMint(recipient, tokenId);
        return tokenId; // Need to return id?
    }

    function royaltyInfo(uint256, uint256 salePrice) external view override(IERC2981)
        returns (address, uint256)
    {
        return(_owner, (salePrice / 100) * 6);
    }
    
    function toggleRelease() external onlyOwner {
        // Release/Lock NFT collection for minting
        isReleased = !isReleased;
    }

    function release() public view
        returns (bool)
    {
        return isReleased;
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

    function redeem(address owner, uint256 tokenId) public
        returns (bool)
    {
        uint256 num_tokens = balanceOf(owner);
        require(num_tokens > 0, "NO_TOKEN_IN_POSSESSION");

        for (uint256 idx = 0; idx < num_tokens; idx++) {
            uint256 tokenToCompare = tokenOfOwnerByIndex(owner, idx);
            if (tokenToCompare == tokenId) {
                _burn(tokenId);
                return true;
            }
        }
        
        return false;
    }
    
}
