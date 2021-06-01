pragma solidity ^0.5.0;


contract Marketplace {
	string public name;

	uint public productCount = 0; //to count products so that mapping doesnt return blank Product

	mapping(uint => Product) public products;

	struct Product {
		uint id;
		string name;
		uint price;
		address payable owner;
		bool purchased;
	}

	event ProductCreated(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	event ProductPurchased(
		uint id,
		string name,
		uint price,
		address payable owner,
		bool purchased
	);

	constructor() public {
		name = "ETH Marketplace";
	}

	function createProduct(string memory _name, uint _price) public {
		// Require a name
		require(bytes(_name).length > 0);

		// Require a valid price
		require(_price > 0);

		// Increment product count
		productCount ++;
		// Create product
		products[productCount] = Product(productCount, _name, _price, msg.sender, false);
		// Trigger an event
		emit ProductCreated(productCount, _name, _price, msg.sender, false);
	}

	function purchaseProduct(uint _id) public payable {
		// Fetch the product
		Product memory _product = products[_id]; // get the product from mapping then copy it to a local (memory) variable _product

		// Fetch the owner
		address payable _seller = _product.owner;

		// Make sure the product is valid
		require(_product.id > 0 && _product.id <= productCount);

		// Require that there is enough Ether in the transaction
		require(msg.value >= _product.price);

		// Require that the product has not been purchased already
		require(!_product.purchased);

		// Require that the buyer is not the seller
		require(_seller != msg.sender);

		// Transfer ownership to the buyer
		_product.owner = msg.sender;

		// Mark as purchased
		_product.purchased = true;

		// Update the product
		products[_id] = _product; // put back to product mapping

		// Pay the seller by sending them Ether
		address(_seller).transfer(msg.value); // take the Ether that get from seller and send to buyer

		// Trigger an event
		emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
	}


}