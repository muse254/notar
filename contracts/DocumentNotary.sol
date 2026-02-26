// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReceiver.sol";

/// @title DocumentNotary
/// @notice Minimal contract for storing document hashes via Chainlink workflows
/// @dev Supports both fixed and dynamic notarized documents
/// @author Osoro Bironga
contract DocumentNotary is IReceiver {

    /// @dev Emitted when the contract is deployed
    event ContractDeployed(address indexed deployer, address indexed forwarder);

        /// @dev Modifier to restrict access to the Chainlink forwarder only
        modifier onlyForwarder() {
            if (msg.sender != forwarder) revert UnauthorizedForwarder();
            _;
        }
    
    // Document types
    enum DocumentType { FIXED, DYNAMIC }
    
    // Base Document structure
    /// @notice Base document structure containing hash, timestamp, and notarizer
    struct Document {
        bytes32 hash;
        uint256 timestamp;
        address notarizer;
    }

    // DocumentHistory (For fixed documents, only one version is stored; for dynamic documents, multiple versions are stored in the same array.)
    struct DocumentHistory {
        Document[] versions;
        bool exists;
    }

    // Storage
    /// @notice Mapping of documentId to DocumentHistory. For fixed documents, only one version is stored; for dynamic documents, multiple versions are stored in the same array.
    mapping(bytes32 => DocumentHistory) public documentHistories;
    /// @notice Mapping of notarizer address to array of documentIds
    mapping(address => bytes32[]) public notarizerDocuments;
    
    // Chainlink Forwarder address (set during deployment)
    /// @notice Chainlink Forwarder address (set during deployment)
    address public immutable forwarder;
    
    // Events
    event DocumentNotarized(
        bytes32 indexed documentId,
        bytes32 indexed documentHash,
        address indexed notarizer,
        DocumentType docType
    );
    
    // Errors
    error UnauthorizedForwarder();
    error DocumentAlreadyExists();
    error DocumentNotFound();
    error InvalidDocumentHash();
    
    /// @notice Contract constructor
    /// @param _forwarder The Chainlink forwarder address
    /// @dev Emits ContractDeployed event and validates non-zero forwarder
    constructor(address _forwarder) payable {
        emit ContractDeployed(msg.sender, _forwarder);
        require(_forwarder != address(0), "Forwarder address cannot be zero");
        forwarder = _forwarder;
    }
    
    /// @inheritdoc IReceiver
    /// @notice Chainlink callback function - receives workflow reports
    /// @dev Only callable by the forwarder
    /// @param report ABI-encoded document data
    function onReport(bytes calldata /*metadata*/, bytes calldata report) external override onlyForwarder {
        // Decode the report - expecting (bytes32 documentId, bytes32 documentHash, uint8 docType, address notarizer)
        (bytes32 documentId, bytes32 documentHash, uint8 docType, address notarizer) = 
            abi.decode(report, (bytes32, bytes32, uint8, address));

        if (documentHash == bytes32(0)) revert InvalidDocumentHash();

        DocumentHistory storage history = documentHistories[documentId];
        if (DocumentType(docType) == DocumentType.FIXED) {
            if (history.exists) revert DocumentAlreadyExists();
            // Store single version for fixed
            Document memory doc = Document({
                hash: documentHash,
                timestamp: block.timestamp,
                notarizer: notarizer
            });
            history.versions.push(doc);
            history.exists = true;
        } else {
            // DYNAMIC: always append new version
            Document memory doc = Document({
                hash: documentHash,
                timestamp: block.timestamp,
                notarizer: notarizer
            });
            history.versions.push(doc);
            history.exists = true;
        }

        // Track by notarizer (only add if first time)
        if (notarizerDocuments[notarizer].length == 0 || notarizerDocuments[notarizer][notarizerDocuments[notarizer].length-1] != documentId) {
            notarizerDocuments[notarizer].push(documentId);
        }

        emit DocumentNotarized(
            documentId,
            documentHash,
            notarizer,
            DocumentType(docType)
        );
    }
    
    /// @notice Verify a document exists and matches the provided hash
    /// @dev Returns true if document exists and hash matches (for fixed: single hash, for dynamic: any version)
    /// @param documentId Unique document identifier
    /// @param expectedHash Expected document hash
    /// @return verified Whether document exists and hash matches
    function verifyDocument(bytes32 documentId, bytes32 expectedHash) 
        external 
        view 
        returns (bool verified) 
    {
        DocumentHistory storage history = documentHistories[documentId];
        if (history.exists) {
            for (uint256 i = 0; i < history.versions.length; i++) {
                if (history.versions[i].hash == expectedHash) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /// @notice Get document version history (for both fixed and dynamic)
    /// @dev Reverts if document does not exist
    /// @param documentId Unique document identifier
    /// @return versions Array of document versions (length 1 for fixed, >1 for dynamic)
    function getDocumentHistory(bytes32 documentId)
        external
        view
        returns (Document[] memory versions)
    {
        DocumentHistory storage history = documentHistories[documentId];
        if (!history.exists) revert DocumentNotFound();
        return history.versions;
    }
    
    /// @notice Get documents notarized by an address
    /// @param notarizer Address of the notarizer
    /// @return documentIds Array of document IDs
    function getNotarizerDocuments(address notarizer) 
        external 
        view 
        returns (bytes32[] memory documentIds) 
    {
        return notarizerDocuments[notarizer];
    }
    
    /// @notice Check if document exists (fixed or dynamic)
    /// @param documentId Unique document identifier
    /// @return exists Whether document exists
    function documentExists(bytes32 documentId) 
        external 
        view 
        returns (bool exists) 
    {
        return documentHistories[documentId].exists;
    }
}