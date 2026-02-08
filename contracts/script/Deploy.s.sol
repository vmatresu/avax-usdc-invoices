// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {InvoiceManager} from "../src/InvoiceManager.sol";

contract DeployFuji is Script {
    InvoiceManager public invoiceManager;

    function run() external returns (InvoiceManager) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        invoiceManager = new InvoiceManager();

        vm.stopBroadcast();

        console.log("========================================");
        console.log("InvoiceManager deployed to Fuji");
        console.log("========================================");
        console.log("Contract Address:", address(invoiceManager));
        console.log("Deployer Address:", deployer);
        console.log("Network: Avalanche Fuji Testnet (C-Chain)");
        console.log("Chain ID: 43113");
        console.log("========================================");

        return invoiceManager;
    }
}

contract DeployMainnet is Script {
    InvoiceManager public invoiceManager;

    function run() external returns (InvoiceManager) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        invoiceManager = new InvoiceManager();

        vm.stopBroadcast();

        console.log("========================================");
        console.log("InvoiceManager deployed to Mainnet");
        console.log("========================================");
        console.log("Contract Address:", address(invoiceManager));
        console.log("Deployer Address:", deployer);
        console.log("Network: Avalanche Mainnet C-Chain");
        console.log("Chain ID: 43114");
        console.log("========================================");

        return invoiceManager;
    }
}
