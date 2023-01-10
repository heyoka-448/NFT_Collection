import styles from '../styles/Home.module.css';
import {useEffect , useRef, useState} from 'react';
import Web3Modal from "web3modal";
import {providers,Contract , utils} from "ethers";
import Head from "next/head"
import { NFT_CONTRACT_ABI , NFT_CONTRACT_ADDRESS } from '../constants';


export default function Home() {

  const [isOwner, setIsOwner] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading,setLoading] = useState(false);
  const [numsTokensMinted, setNumsTokensMinted] = useState("");
  const web3ModalRef = useRef();

  const getNumMintedTokens = async () =>{
    try {
     const provider = await getProviderOrSigner();

      //get instance of nft contract
     const nftContract = new Contract(
     NFT_CONTRACT_ADDRESS ,
     NFT_CONTRACT_ABI , 
     provider
     );

     const numTokenIds = await nftContract.tokenIds();
     setNumsTokensMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  }

  const presaleMint = async ()=>{
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      //get instance of nft contract
      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS ,
      NFT_CONTRACT_ABI , 
      signer
      );

      const txn = await nftContract.presaleMint({
        value: utils.parseEther("0.01")
      });

      await txn.wait();
      window.alert('You have succesfully minted Crypto Dev')
  
    } catch (error) {
      console.error(error)
    }
    setLoading(false);

  }

  const publicMint = async ()=>{
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      //get instance of nft contract
      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS ,
      NFT_CONTRACT_ABI , 
      signer
      );

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01")
      });

      await txn.wait();
      window.alert('You have succesfully minted Crypto Dev')
 
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const getOwner = async () =>{
    try {
      const signer = await getProviderOrSigner(true);

      //get instance of nft contract
      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS ,
      NFT_CONTRACT_ABI , 
      signer
      );
      const owner =await nftContract.owner();
      const userAddress =await signer.getAddress();
      if(owner.toLowerCase() === userAddress.toLowerCase()){
        setIsOwner(true);
      }

    } catch (error) {
      console.log(error)
    }
  }

  // we need 2 functions that is check whether presale started and 2nd to start presale
  const startPresale = async () =>{
    setLoading(true)
    try {
      // this time we will need a signer bcoz when we start a presale we send a transaction we change state of function
      const signer = await getProviderOrSigner(true);

      //get instance of nft contract
      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS ,
      NFT_CONTRACT_ABI , 
      signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const checkIfPresaleEnded= async () =>{
    try {
      const provider = await getProviderOrSigner();

      //get instance of nft contract
     const nftContract = new Contract(
     NFT_CONTRACT_ADDRESS ,
     NFT_CONTRACT_ABI , 
     provider
     );
     // this will be big number i.e uint256 
     // timestamp inseconds
      const preSaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000 ;
      //lt->lessthan
      const hasPresaleEnded = preSaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  }

  const checkIfPresaleStarted = async () =>{
    try {
      const provider = await getProviderOrSigner();

      //get instance of nft contract
      const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS ,
      NFT_CONTRACT_ABI , 
      provider
      );
      
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const connectWallet = async () =>{
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  const getProviderOrSigner = async (needSigner = false)=>{
    //we need to gain access to provider/signer from metamsk
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    //if the user is not connected to goerli then tell them to switch it to goerli
     const {chainId} = await web3Provider.getNetwork();
     if(chainId !== 5){
      window.alert('Please switch it to goerli');
      throw new Error("Incorrect network");
     }
     //to send data we need signer we need signer
     if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
     }
     return web3Provider;
  }

  const onPageLoad = async () =>{
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if(presaleStarted){
      await checkIfPresaleEnded();
    }
    await getNumMintedTokens();

    // Track in real time the number of minted nft
    setInterval(async()=>{
      await getNumMintedTokens();
    },5*1000);
    // Track in real time the status of presale (started,ended,whatever)
    setInterval(async()=>{
      const presaleStarted = await checkIfPresaleStarted();
      if(presaleStarted){
        await checkIfPresaleEnded();
      }
    })
  }

   useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider:false
      });
      onPageLoad();
    }
   },[]);

   function renderBody(){
    if(!walletConnected){
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Your Wallet
        </button>
      )
    }

    if(loading){
      return <span className={styles.description}>Loading...</span>
    }
    if(isOwner && !presaleStarted){
      //render a button to start preSaalle

      return(
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      );
    }
    if(!presaleStarted){
      // just say thay presale hasn't started yet , come back later
      return(
        <div>
          <span className={styles.description}>
            Presale has not yet started. Come back later!
          </span>
        </div>
      )
    }
    if(presaleStarted && !presaleEnded){
      //allow users to mint in presale
      // they need to be in whitelist for this to work
      return (
        <div>
          <span className={styles.description}>
            Presale has started If your address is whitelisted, You can mint a CryptoDev!
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }
    if(presaleEnded){
      //allow users to take part in public sale
      return(
        <div>
          <span className={styles.description}>
            Presale has ended.
            You can mintt a CryptoDev in public sale, if any remain
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </div>
      )
    }
   }
  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT</h1>
          <div className={styles.description}>CryptoDevs NFT is Collection for developers in web3 </div>
          <div className={styles.description}>
            {numsTokensMinted}/20 have been minted already!
          </div>
          <div>
          { renderBody()}
          </div>
        </div>
        <img className={styles.image} src="/cryptodevs/0.svg"/>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
