// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CreditStars is ERC721Enumerable, Ownable{
    string _baseTokenUri ;

    IWhitelist whitelist;

    bool public presaleStarted;

    uint256 public presaleEnded;

    uint256 public maxTokenIds = 10000;

    uint256 public tokenIds;

    uint256 public _price = 10000 ether; // price for 1 nft

    bool public _paused;

    modifier onlyWhenNotPaused {
        require(!_paused , "Contract currently paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContract) ERC721("Credit Stars","CSTARS") {
        _baseTokenUri = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }
    function presaleMint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp < presaleEnded,"Pre-Sale ended");
        // To check whether it is a whitelisted address
        require(whitelist.whitelistedAddresses(msg.sender),"you are not in whitelist");
        //  max number of nfts that can be minted are 20
        require(tokenIds < maxTokenIds,"Exceeded the limit");
        // amount money sent is greater or equal to nft prices
        require(msg.value >= _price,"Ether sent is not correct");

        tokenIds += 1;

        _safeMint(msg.sender,tokenIds);
    }
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded,"Presale has not ended");
        require(tokenIds < maxTokenIds,"Exceeded the limit");
        require(msg.value >= _price,"Ether sent is not corect");
        tokenIds += 1;

        _safeMint(msg.sender,tokenIds);
    }

    // to stop minting or pause  prevent attacks
    


    function _baseURI() internal view override returns (string memory){
        return _baseTokenUri;
    }

    // since sc is holding moneey we need to send it to the owner
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent,) = _owner.call{value:amount}("");
        require(sent,"Failed to send ether");
    }
    // to receive ether
    receive() external payable{}

    fallback() external payable{}
}