export const DocumentNotary = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_forwarder",
                "type": "address"
            }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "DocumentAlreadyExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "DocumentNotFound",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidDocumentHash",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnauthorizedForwarder",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "deployer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "forwarder",
                "type": "address"
            }
        ],
        "name": "ContractDeployed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "documentHash",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "notarizer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "enum DocumentNotary.DocumentType",
                "name": "docType",
                "type": "uint8"
            }
        ],
        "name": "DocumentNotarized",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            }
        ],
        "name": "documentExists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "documentHistories",
        "outputs": [
            {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "forwarder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            }
        ],
        "name": "getDocumentHistory",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "hash",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "notarizer",
                        "type": "address"
                    }
                ],
                "internalType": "struct DocumentNotary.Document[]",
                "name": "versions",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "notarizer",
                "type": "address"
            }
        ],
        "name": "getNotarizerDocuments",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "documentIds",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "notarizerDocuments",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "report",
                "type": "bytes"
            }
        ],
        "name": "onReport",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "documentId",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "expectedHash",
                "type": "bytes32"
            }
        ],
        "name": "verifyDocument",
        "outputs": [
            {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const