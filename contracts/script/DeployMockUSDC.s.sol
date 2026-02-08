// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../test/InvoiceManager.t.sol";

contract DeployMockUSDC is Script {
    MockUSDC public mockUSDC;

    function run() external returns (MockUSDC) {
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        mockUSDC = new MockUSDC();

        vm.stopBroadcast();

        console.log("========================================");
        console.log("MockUSDC deployed locally");
        console.log("========================================");
        console.log("Contract Address:", address(mockUSDC));
        console.log("Deployer Address:", deployer);
        console.log("Network: Local Anvil");
        console.log("Chain ID: 31337");
        console.log("========================================");

        return mockUSDC;
    }
}
