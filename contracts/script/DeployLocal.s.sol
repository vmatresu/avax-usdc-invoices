// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {InvoiceManager} from "../src/InvoiceManager.sol";

contract DeployLocal is Script {
    InvoiceManager public invoiceManager;

    function run() external returns (InvoiceManager) {
        // Use hardcoded test key for local testing
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        invoiceManager = new InvoiceManager();

        vm.stopBroadcast();

        console.log("========================================");
        console.log("InvoiceManager deployed locally");
        console.log("========================================");
        console.log("Contract Address:", address(invoiceManager));
        console.log("Deployer Address:", deployer);
        console.log("Network: Local Anvil");
        console.log("Chain ID: 31337");
        console.log("========================================");

        return invoiceManager;
    }
}
