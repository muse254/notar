import {
  HTTPCapability,
  EVMClient,
  handler,
  prepareReportRequest,
  type Runtime,
  type HTTPPayload,
  Runner
} from "@chainlink/cre-sdk"
import { encodeAbiParameters, parseAbiParameters, keccak256, encodePacked } from "viem"

type Config = {
  authorizedEVMAddress: string
  contractAddress: string
  chainSelector: keyof typeof EVMClient.SUPPORTED_CHAIN_SELECTORS
}

interface DocumentRequest {
  documentHash: string
  documentType: 'FIXED' | 'DYNAMIC' // 0 = FIXED, 1 = DYNAMIC
  notarizerAddress: string
  documentId?: string // Optional, will generate if not provided
}

// Callback function that processes document notarization requests
const onHttpTrigger = async (runtime: Runtime<Config>, payload: HTTPPayload) => {
  runtime.log(`HTTP trigger received for document notarization`)

  try {
    // Parse the incoming document request
    const {
      documentHash,
      documentType,
      notarizerAddress,
      documentId
    } = payload.input as unknown as DocumentRequest

    // Validate input
    if (!documentHash || !notarizerAddress) {
      throw new Error("Missing required fields: documentHash and notarizerAddress")
    }

    // Generate document ID if not provided
    const finalDocumentId = documentId || keccak256(
      encodePacked(
        ['string', 'string', 'address', 'uint256'],
        [documentHash, documentType, notarizerAddress as `0x${string}`, BigInt(Date.now())]
      )
    )

    runtime.log(`Processing document: ${finalDocumentId}`)

    // Instantiate EVM client with the chain selector bigint
    const chainSelectorBigInt = EVMClient.SUPPORTED_CHAIN_SELECTORS[runtime.config.chainSelector]
    const evmClient = new EVMClient(chainSelectorBigInt)

    // Prepare data for contract call
    const documentTypeEnum = documentType === 'FIXED' ? 0 : 1

    // ABI encode the report data according to contract expectations
    // Contract expects: (bytes32 documentId, bytes32 documentHash, uint8 docType, address notarizer)
    const reportData = encodeAbiParameters(
      parseAbiParameters('bytes32, bytes32, uint8, address'),
      [
        finalDocumentId as `0x${string}`,
        documentHash as `0x${string}`,
        documentTypeEnum,
        notarizerAddress as `0x${string}`
      ]
    )

    runtime.log(`Encoded report data: ${reportData}`)

    // Generate signed report via consensus using the SDK helper
    const signedReport = runtime.report(prepareReportRequest(reportData)).result()

    runtime.log(`Generated signed report`)

    // Submit the report to the consumer contract
    evmClient.writeReport(runtime, {
      receiver: runtime.config.contractAddress,
      report: signedReport
    }).result()

    runtime.log(`Document ${finalDocumentId} successfully notarized on chain`)

    return {
      success: true,
      documentId: finalDocumentId,
      documentHash,
      documentType,
      notarizerAddress,
      timestamp: Date.now()
    }

  } catch (error) {
    runtime.log(`Error processing document notarization: ${error}`)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

const initWorkflow = (config: Config) => {
  const httpTrigger = new HTTPCapability()

  return [
    handler(
      httpTrigger.trigger({
        authorizedKeys: [
          {
            type: "KEY_TYPE_ECDSA_EVM",
            publicKey: config.authorizedEVMAddress,
          },
        ],
      }),
      onHttpTrigger
    ),
  ]
}

export async function main() {
  const runner = await Runner.newRunner<Config>()
  await runner.run(initWorkflow)
}
