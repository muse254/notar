# Document Notarization System

## Overview

This system provides minimal document hash storage on blockchain via Chainlink workflows, supporting both fixed and dynamic notarized documents.

## Architecture

### Smart Contract: `DocumentNotary.sol`
- Implements `IReceiver` interface for Chainlink integration
- Stores document hashes with metadata (timestamp, notarizer, type)
- Supports two document types:
  - **FIXED**: Static documents that won't change
  - **DYNAMIC**: Documents that may be updated

### Chainlink Workflow: `main.ts`
- HTTP trigger for external document notarization requests
- ABI encodes document data and submits via Chainlink's secure write flow
- Generates unique document IDs if not provided

## Deployment

1. Deploy `DocumentNotary.sol` with Chainlink Forwarder address
2. Configure workflow with:
   - Contract address
   - Authorized EVM address
   - Chain selector

## API Usage

### Notarize Document

Send HTTP POST to workflow endpoint:

```json
{
  "documentHash": "0x1234567890abcdef...",
  "documentType": "FIXED",
  "notarizerAddress": "0xYourAddress...",
  "documentId": "0xOptionalCustomId..." // Optional
}
```

### Verify Document

Call contract directly:
```javascript
const verified = await contract.verifyDocument(documentId, expectedHash);
const document = await contract.getDocument(documentId);
```

## Features

- **Minimal**: Only essential document hash storage
- **Secure**: Chainlink's cryptographically signed reports
- **Flexible**: Support for both fixed and dynamic documents
- **Traceable**: Event emission and notarizer tracking
- **Gas Efficient**: Minimal storage and operations