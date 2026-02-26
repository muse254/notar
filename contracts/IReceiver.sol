// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IReceiver
 * @dev Interface for receiving Chainlink workflow reports
 */
interface IReceiver {
    /**
     * @notice Called when a report is received
     * @param metadata Metadata from Chainlink workflow
     * @param report ABI-encoded document data
     */
    function onReport(bytes calldata metadata, bytes calldata report) external;
}
