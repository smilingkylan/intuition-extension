# Intuition Extension Specifications

Intuition Extension is a browser extension built in Plasmo and Typescript. The purpose of this extension is to monitor user browsing activity to give Intuition-based insights, and allow users to contribute to the Intuition data via interactions with its smart contract.

## Intuition Basics

Intuition is an EVM-based and smart contract-based ecosystem where users are able to compose claims about nearly anything, and stake cryptocurrency onto that claim to give it more *weight*.

*Atoms*: atoms are the smallest unit (primitive) of the Intuition system. They encapsulate a single idea: a person, a photo, a website, an EVM account / address, an ENS (Ethereum Name Service) address, etc. Their data typically takes the form of: an IPFS hash to their JSON data, an EVM address, URL, or an ENS address. The format that the JSON takes is typically something like:

```
{
  "@type": "Person",
  "@context": "https://schema.org",
  "name": "Donald J. Trump"
  "description": "businessman, real estate mogul, and U.S. president",
  ...
}
```

Where each of these fields is required and more fields can be trivially added. 

*Triples*: triples are the main form of a *claim* made on Intuition. Triples specifically **consist of three sequential atoms**. These are labeled the *subject*, *predicate*, and *object* respectively. These claims can be read sequentially via their `label` field which is derived either from the JSON's `name` field, or URI, address, or ENS name. For example if I have two other atoms with `name` field values `is` and `trustworthy` then we can assemble them to make the claim `Donald J. Trump is trustworhy`.

*Staking*: users are given the opportunity to stake money on a triple either **for** or **against** the composed claim. Both staking and unstaking incur fees from the smart contract. This added "weight" to each claim can help give it more visibility, and gives the network more statistical data to work with.

## Extension Architecture

This extension is split into three main parts:

1. **Background script**: maintains connection to Web3 wallet and persists info (especially about our wallet connection so that it can be used by the UI to connect to the wallet)
2. **Content scripts**: scripts that operate on targeted URLs and react to user behavior to try to discern what type of information the user may want from the Intuition system. The hope is to allow third-party developers to write self-contained content scripts for specifics websites (ie *domains*). For example notifying the extension of the following:
   - whuch YouTube channel a user is browsing
   - which Tweet they are reading
   - which EVM address they are planning to send money to
   - which smart contract they are about to interact with
   - which Spotify song a user is listening to
3. **Sidepanel**: main UI component used for displaying *relevant* Intuition insights and facilitating contract interactions like creating atoms and triples, or (un)staking. Since sidepanels are not persistent, transaction creation will use an ad-hoc wallet connection initialized with the wallet state persisted by the background script.

## Plug-ins

As mentioned earlier the idea is to allow third-party developers to build their own content scripts as `npm` modules that can be plugged in to Intuition Extension. These plugins can be enabled by the extension to play the role of **sending atom / triple queries to the sidepanel** where relevant insights and actions can be shown. Since content scripts are enabled on a per-URL basis we can cleanly separate the different modules based on which website(s) they operate on top of.

More information about developing an Intuition Extension plugin coming out in the coming weeks