import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo3.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
          
        // Request account access if needed
        await window.ethereum.enable();
          
      }

      // Legacy dapp browsers...
      else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
      }
      // Non-dapp browsers...
      else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      };
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount.call() //call(): read the data
      this.setState({ productCount })
      // Load products
      for (var i; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call() // read the data
        this.setState({
          products: [...this.state.products, product] //add the product to the array of products in the component state
        })
      }
      this.setState({ loading: false })
      console.log(this.state.products)
    } else {
      window.alert("Marketplace contract not deployed to detected network.")
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this) // to let React now this.createProduct takes the function createProduct
  }

  createProduct(name, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.createProduct(name, price).send({ from:this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className = "container-fluid mt-5">
          <div className ="row">
            <main role="main" className = "col-lg-12 d-flex">
              { this.state.loading 
                ? <div id="loader" className="text-center"><p className = "text-center">Loading...</p></div> 
                : <Main createProduct={this.createProduct}/>
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
