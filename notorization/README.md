# Document Notarization Workflow

This workflow provides document hash notarization on blockchain using Chainlink CRE with HTTP triggers. It uses a custom `DocumentNotary` contract that implements the `IReceiver` interface for secure on-chain writes.

## Key Features

- **viem-based ABI handling**: Type-safe contract interactions with manual ABI definitions
- **HTTP triggers**: Accept document notarization requests via authenticated endpoints
- **Minimal contract**: Only stores essential document hashes and metadata
- **Dual document types**: Support for both FIXED and DYNAMIC documents

FIXED documents have immutable hashes while DYNAMIC documents can be updated with new hashes to add a history of changes and have the same document ID.

## Setup Guide

## 1. Update .env file

Add a funded private key to `.env` for chain write operations:

```
CRE_ETH_PRIVATE_KEY=your_private_key_here
```

## 2. Install dependencies

```bash
cd notorization && bun install
```

## 3. Configure RPC endpoints

Add RPC endpoints in `project.yaml` for your target chain:

```yaml
rpcs:
  ethereum-testnet-sepolia: "https://your-sepolia-rpc-url"
  polygon-mainnet: "https://your-polygon-rpc-url"
```

Supported chains: Ethereum, Base, Avalanche, Polygon, BNB Chain, Arbitrum, Optimism

## 4. Deploy DocumentNotary contract

Deploy the `DocumentNotary.sol` contract with the Chainlink Forwarder address for your target network. The contract ABI is already provided in `../contracts/abi/DocumentNotary.ts`.

### viem ABI Approach

The workflow uses viem's type-safe ABI handling:

- Manual ABI definitions as TypeScript constants
- Full type inference for contract calls
- No code generation required
- Built-in helpers like `getNetwork()`, `bytesToHex()`

## 5. Configure workflow

Create `config.json` with your deployed contract details:

```json
{
  "authorizedEVMAddress": "0xYourAuthorizedAddress",
  "contractAddress": "0xYourDocumentNotaryAddress",
  "chainSelector": "ethereum-testnet-sepolia"
}
```

Update `workflow.yaml`:

```yaml
staging-settings:
  user-workflow:
    workflow-name: "document-notary"
  workflow-artifacts:
    workflow-path: "./main.ts"
    config-path: "./config.json"
    secrets-path: ""
```

## 6. Test the workflow

### Simulate locally

```bash
cre workflow simulate ./notorization
```

Select the HTTP trigger option and test with document data.

### Test with HTTP requests

Send POST requests to your deployed workflow:

```json
{
  "documentHash": "0x1234567890abcdef...",
  "documentType": "FIXED",
  "notarizerAddress": "0xYourAddress...",
  "documentId": "0xOptionalCustomId..."
}
```

## Contract Integration

The workflow uses viem for type-safe contract interactions:

```typescript
// ABI encoding with viem
const reportData = encodeAbiParameters(
  parseAbiParameters('bytes32, bytes32, uint8, address'),
  [documentId, documentHash, documentType, notarizerAddress]
);

// Secure write flow
const signedReport = runtime.report(reportData);
await evmClient.writeReport({
  contractAddress: config.contractAddress,
  signedReport
}).result();
```
