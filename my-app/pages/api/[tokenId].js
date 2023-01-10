// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

//Base Uri + Tokenid
// Base Uri = http://example.com/
// Token ID = 1
// tokenuri(1)=>http://example.com/1
export default function handler(req, res) {
    // get the tokenId from the query params
    const {tokenId} = req.query;
    const name = `Crypto Dev #${tokenId}`;
    const description = "Cryto devs is an NFT collection of web3 developers";
    const image =`https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`;

    return res.json({
        name:name,
        description:description,
        image:image
    })
  }
  