export default [
  { "inputs": [], "name": "EnforcedPause", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_AdminOnly", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_ArraysNotSameLength",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "atomId", "type": "uint256" }
    ],
    "name": "EthMultiVault_AtomDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "atomUri", "type": "bytes" }],
    "name": "EthMultiVault_AtomExists",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_AtomUriTooLong", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_BurnFromZeroAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_BurnInsufficientBalance",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_CannotApproveSelf", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_CannotRevokeSelf", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_DeployAccountFailed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_DepositOrWithdrawZeroShares",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_HasCounterStake", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_InsufficientDepositAmountToCoverFees",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "remainingShares",
        "type": "uint256"
      }
    ],
    "name": "EthMultiVault_InsufficientRemainingSharesInVault",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_InsufficientSharesInVault",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_InvalidAtomDepositFractionForTriple",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_InvalidEntryFee", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_InvalidExitFee", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_InvalidProtocolFee", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_MinimumDeposit", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_OperationAlreadyExecuted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_OperationAlreadyScheduled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EthMultiVault_OperationNotScheduled",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_ReceiveNotAllowed", "type": "error" },
  {
    "inputs": [],
    "name": "EthMultiVault_SenderAlreadyApproved",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_SenderNotApproved", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_TimelockNotExpired", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_TransferFailed", "type": "error" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "subjectId", "type": "uint256" },
      { "internalType": "uint256", "name": "predicateId", "type": "uint256" },
      { "internalType": "uint256", "name": "objectId", "type": "uint256" }
    ],
    "name": "EthMultiVault_TripleExists",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_VaultDoesNotExist", "type": "error" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "EthMultiVault_VaultIsTriple",
    "type": "error"
  },
  { "inputs": [], "name": "EthMultiVault_VaultNotAtom", "type": "error" },
  { "inputs": [], "name": "EthMultiVault_VaultNotTriple", "type": "error" },
  { "inputs": [], "name": "ExpectedPause", "type": "error" },
  { "inputs": [], "name": "InvalidInitialization", "type": "error" },
  { "inputs": [], "name": "NotInitializing", "type": "error" },
  { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldAdmin",
        "type": "address"
      }
    ],
    "name": "AdminSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "atomWallet",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "atomData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "vaultID",
        "type": "uint256"
      }
    ],
    "name": "AtomCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAtomCreationProtocolFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAtomCreationProtocolFee",
        "type": "uint256"
      }
    ],
    "name": "AtomCreationProtocolFeeSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAtomDepositFractionForTriple",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAtomDepositFractionForTriple",
        "type": "uint256"
      }
    ],
    "name": "AtomDepositFractionForTripleSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAtomDepositFractionOnTripleCreation",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAtomDepositFractionOnTripleCreation",
        "type": "uint256"
      }
    ],
    "name": "AtomDepositFractionOnTripleCreationSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAtomUriMaxLength",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAtomUriMaxLength",
        "type": "uint256"
      }
    ],
    "name": "AtomUriMaxLengthSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "atomWallet",
        "type": "address"
      }
    ],
    "name": "AtomWalletDeployed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAtomWalletInitialDepositAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAtomWalletInitialDepositAmount",
        "type": "uint256"
      }
    ],
    "name": "AtomWalletInitialDepositAmountSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAtomWarden",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldAtomWarden",
        "type": "address"
      }
    ],
    "name": "AtomWardenSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "receiverTotalSharesInVault",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "senderAssetsAfterTotalFees",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sharesForReceiver",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "entryFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isTriple",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isAtomWallet",
        "type": "bool"
      }
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newEntryFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldEntryFee",
        "type": "uint256"
      }
    ],
    "name": "EntryFeeSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newExitFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldExitFee",
        "type": "uint256"
      }
    ],
    "name": "ExitFeeSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "protocolMultisig",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FeesTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "version",
        "type": "uint64"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMinDeposit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldMinDeposit",
        "type": "uint256"
      }
    ],
    "name": "MinDepositSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMinShare",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldMinShare",
        "type": "uint256"
      }
    ],
    "name": "MinShareSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "operationId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "OperationCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "operationId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "readyTime",
        "type": "uint256"
      }
    ],
    "name": "OperationScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newProtocolFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldProtocolFee",
        "type": "uint256"
      }
    ],
    "name": "ProtocolFeeSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "senderTotalSharesInVault",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "assetsForReceiver",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sharesRedeemedBySender",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "exitFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "vaultId",
        "type": "uint256"
      }
    ],
    "name": "Redeemed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "SenderApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "SenderRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subjectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "predicateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "objectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "vaultID",
        "type": "uint256"
      }
    ],
    "name": "TripleCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newTripleCreationProtocolFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldTripleCreationProtocolFee",
        "type": "uint256"
      }
    ],
    "name": "TripleCreationProtocolFeeSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newProtocolMultisig",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldProtocolMultisig",
        "type": "address"
      }
    ],
    "name": "protocolMultisigSet",
    "type": "event"
  },
  { "stateMutability": "payable", "type": "fallback" },
  {
    "inputs": [],
    "name": "SET_ADMIN",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_EXIT_FEE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "approvals",
    "outputs": [
      { "internalType": "bool", "name": "isApproved", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "approveSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "atomConfig",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "atomWalletInitialDepositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "atomCreationProtocolFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "atomDepositFractionAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "atomId", "type": "uint256" }
    ],
    "name": "atoms",
    "outputs": [
      { "internalType": "bytes", "name": "atomData", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "atomHash", "type": "bytes32" }
    ],
    "name": "atomsByHash",
    "outputs": [
      { "internalType": "uint256", "name": "atomId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes[]", "name": "atomUris", "type": "bytes[]" }
    ],
    "name": "batchCreateAtom",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "subjectIds",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "predicateIds",
        "type": "uint256[]"
      },
      { "internalType": "uint256[]", "name": "objectIds", "type": "uint256[]" }
    ],
    "name": "batchCreateTriple",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "operationId", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "cancelOperation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "computeAtomWalletAddr",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "convertToAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "convertToShares",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "count",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "atomUri", "type": "bytes" }],
    "name": "createAtom",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "subjectId", "type": "uint256" },
      { "internalType": "uint256", "name": "predicateId", "type": "uint256" },
      { "internalType": "uint256", "name": "objectId", "type": "uint256" }
    ],
    "name": "createTriple",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "currentSharePrice",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "atomId", "type": "uint256" }
    ],
    "name": "deployAtomWallet",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "depositAtom",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "depositTriple",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "entryFeeAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "exitFeeAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "generalConfig",
    "outputs": [
      { "internalType": "address", "name": "admin", "type": "address" },
      {
        "internalType": "address",
        "name": "protocolMultisig",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "feeDenominator",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "minDeposit", "type": "uint256" },
      { "internalType": "uint256", "name": "minShare", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "atomUriMaxLength",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "decimalPrecision",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "minDelay", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAtomCost",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAtomWarden",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getCounterIdFromTriple",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "getDepositFees",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "getDepositSharesAndFees",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "getRedeemAssetsAndFees",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getTripleAtoms",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTripleCost",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" },
      { "internalType": "address", "name": "receiver", "type": "address" }
    ],
    "name": "getVaultStateForUser",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "admin", "type": "address" },
          {
            "internalType": "address",
            "name": "protocolMultisig",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "feeDenominator",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "minDeposit",
            "type": "uint256"
          },
          { "internalType": "uint256", "name": "minShare", "type": "uint256" },
          {
            "internalType": "uint256",
            "name": "atomUriMaxLength",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "decimalPrecision",
            "type": "uint256"
          },
          { "internalType": "uint256", "name": "minDelay", "type": "uint256" }
        ],
        "internalType": "struct IEthMultiVault.GeneralConfig",
        "name": "_generalConfig",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "atomWalletInitialDepositAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "atomCreationProtocolFee",
            "type": "uint256"
          }
        ],
        "internalType": "struct IEthMultiVault.AtomConfig",
        "name": "_atomConfig",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tripleCreationProtocolFee",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "atomDepositFractionOnTripleCreation",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "atomDepositFractionForTriple",
            "type": "uint256"
          }
        ],
        "internalType": "struct IEthMultiVault.TripleConfig",
        "name": "_tripleConfig",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "contract IPermit2",
            "name": "permit2",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "entryPoint",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "atomWarden",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "atomWalletBeacon",
            "type": "address"
          }
        ],
        "internalType": "struct IEthMultiVault.WalletConfig",
        "name": "_walletConfig",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "entryFee", "type": "uint256" },
          { "internalType": "uint256", "name": "exitFee", "type": "uint256" },
          {
            "internalType": "uint256",
            "name": "protocolFee",
            "type": "uint256"
          }
        ],
        "internalType": "struct IEthMultiVault.VaultFees",
        "name": "_defaultVaultFees",
        "type": "tuple"
      }
    ],
    "name": "init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "isTriple",
    "outputs": [{ "internalType": "bool", "name": "isTriple", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "isTripleId",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxDeposit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "maxRedeem",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "previewDeposit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "previewRedeem",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "assets", "type": "uint256" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "protocolFeeAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "redeemAtom",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "shares", "type": "uint256" },
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "redeemTriple",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "revokeSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "operationId", "type": "bytes32" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "scheduleOperation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "admin", "type": "address" }
    ],
    "name": "setAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "atomCreationProtocolFee",
        "type": "uint256"
      }
    ],
    "name": "setAtomCreationProtocolFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "atomDepositFractionForTriple",
        "type": "uint256"
      }
    ],
    "name": "setAtomDepositFractionForTriple",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "atomDepositFractionOnTripleCreation",
        "type": "uint256"
      }
    ],
    "name": "setAtomDepositFractionOnTripleCreation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "atomUriMaxLength",
        "type": "uint256"
      }
    ],
    "name": "setAtomUriMaxLength",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "atomWalletInitialDepositAmount",
        "type": "uint256"
      }
    ],
    "name": "setAtomWalletInitialDepositAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "atomWarden", "type": "address" }
    ],
    "name": "setAtomWarden",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "entryFee", "type": "uint256" }
    ],
    "name": "setEntryFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "exitFee", "type": "uint256" }
    ],
    "name": "setExitFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "minDeposit", "type": "uint256" }
    ],
    "name": "setMinDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "minShare", "type": "uint256" }
    ],
    "name": "setMinShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "protocolFee", "type": "uint256" }
    ],
    "name": "setProtocolFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "protocolMultisig",
        "type": "address"
      }
    ],
    "name": "setProtocolMultisig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tripleCreationProtocolFee",
        "type": "uint256"
      }
    ],
    "name": "setTripleCreationProtocolFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "operationHash", "type": "bytes32" }
    ],
    "name": "timelocks",
    "outputs": [
      { "internalType": "bytes", "name": "data", "type": "bytes" },
      { "internalType": "uint256", "name": "readyTime", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tripleConfig",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "tripleCreationProtocolFee",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "atomDepositFractionOnTripleCreation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "atomDepositFractionForTriple",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "tripleHash",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "subjectId", "type": "uint256" },
      { "internalType": "uint256", "name": "predicateId", "type": "uint256" },
      { "internalType": "uint256", "name": "objectId", "type": "uint256" }
    ],
    "name": "tripleHashFromAtoms",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tripleId", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "triples",
    "outputs": [
      { "internalType": "uint256", "name": "tripleAtomIds", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "tripleHash", "type": "bytes32" }
    ],
    "name": "triplesByHash",
    "outputs": [
      { "internalType": "uint256", "name": "tripleId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "vaultFees",
    "outputs": [
      { "internalType": "uint256", "name": "entryFee", "type": "uint256" },
      { "internalType": "uint256", "name": "exitFee", "type": "uint256" },
      { "internalType": "uint256", "name": "protocolFee", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "vaultId", "type": "uint256" }
    ],
    "name": "vaults",
    "outputs": [
      { "internalType": "uint256", "name": "totalAssets", "type": "uint256" },
      { "internalType": "uint256", "name": "totalShares", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "walletConfig",
    "outputs": [
      {
        "internalType": "contract IPermit2",
        "name": "permit2",
        "type": "address"
      },
      { "internalType": "address", "name": "entryPoint", "type": "address" },
      { "internalType": "address", "name": "atomWarden", "type": "address" },
      {
        "internalType": "address",
        "name": "atomWalletBeacon",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  { "stateMutability": "payable", "type": "receive" }
]
