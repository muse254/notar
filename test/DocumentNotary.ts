

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { encodeAbiParameters, parseAbiParameters, keccak256 } from "viem";

describe("DocumentNotary", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  // Helper to encode report for onReport
  function encodeReport(documentId: string, documentHash: string, docType: number, notarizer: string) {
    return encodeAbiParameters(
      parseAbiParameters("bytes32 documentId, bytes32 documentHash, uint8 docType, address notarizer"),
      [documentId, documentHash, docType, notarizer]
    );
  }

  it("Should emit the DocumentNotarized event when calling onReport", async function () {
    const [signer] = await viem.getWalletClients();
    const notary = await viem.deployContract("DocumentNotary", [signer.account.address]);
    const deploymentBlockNumber = await publicClient.getBlockNumber();
    const docHash = keccak256("0x1234") as `0x${string}`;
    const docId = keccak256("0xabcd") as `0x${string}`;
    const docType = 0; // FIXED
    const report = encodeReport(docId, docHash, docType, signer.account.address);
    await notary.write.onReport(["0x", report]);

    const events = await publicClient.getContractEvents({
      address: notary.address,
      abi: notary.abi,
      eventName: "DocumentNotarized",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.args.documentId, docId);
    assert.equal(event.args.documentHash, docHash);
    assert.equal(event.args.notarizer.toLowerCase(), signer.account.address.toLowerCase());
    assert.equal(event.args.docType, docType);
  });

  it("The DocumentNotarized event should match contract state", async function () {
    const [signer] = await viem.getWalletClients();
    const notary = await viem.deployContract("DocumentNotary", [signer.account.address]);
    const deploymentBlockNumber = await publicClient.getBlockNumber();
    const docHash = keccak256("0x5678") as `0x${string}`;
    const docId = keccak256("0xef01") as `0x${string}`;
    const docType = 0; // FIXED
    const report = encodeReport(docId, docHash, docType, signer.account.address);
    await notary.write.onReport(["0x", report]);

    const events = await publicClient.getContractEvents({
      address: notary.address,
      abi: notary.abi,
      eventName: "DocumentNotarized",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });
    assert.equal(events.length, 1);
    const event = events[0];
    assert.equal(event.args.documentId, docId);
    assert.equal(event.args.documentHash, docHash);
    assert.equal(event.args.notarizer.toLowerCase(), signer.account.address.toLowerCase());
    assert.equal(event.args.docType, docType);
    // check contract state
    const verified = await notary.read.verifyDocument([docId, docHash]);
    assert.equal(verified, true);
    const exists = await notary.read.documentExists([docId]);
    assert.equal(exists, true);
  });
  it("Should not allow notarizing the same document twice (FIXED)", async function () {
    const [signer] = await viem.getWalletClients();
    const notary = await viem.deployContract("DocumentNotary", [signer.account.address]);
    const docHash = keccak256("0x5678") as `0x${string}`;
    const docId = keccak256("0xef01") as `0x${string}`;
    const docType = 0; // FIXED
    const report = encodeReport(docId, docHash, docType, signer.account.address);
    await notary.write.onReport(["0x", report]);
    await assert.rejects(
      async () => {
        await notary.write.onReport(["0x", report]);
      },
      (err: any) => {
        // Accept both custom error and revert string
        return (
          (typeof err.message === "string" &&
            (err.message.includes("DocumentAlreadyExists") ||
             err.message.includes("already exists"))) ||
          (typeof err.shortMessage === "string" &&
            err.shortMessage.includes("DocumentAlreadyExists"))
        );
      }
    );
  });

  it("Should return false for non-notarized document", async function () {
    const [signer] = await viem.getWalletClients();
    const notary = await viem.deployContract("DocumentNotary", [signer.account.address]);
    const docId = keccak256("0x9999") as `0x${string}`;
    const docHash = keccak256("0x8888") as `0x${string}`;
    const verified = await notary.read.verifyDocument([docId, docHash]);
    assert.equal(verified, false);
    const exists = await notary.read.documentExists([docId]);
    assert.equal(exists, false);
  });
});
