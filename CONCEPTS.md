# Intuition Basics

Intuition is an EVM-based and smart contract-based ecosystem where users are able to compose claims about nearly anything, and stake cryptocurrency onto that claim to give it more *weight*.

## Atoms

Atoms are the smallest unit (primitive) of the Intuition system. They encapsulate a single idea: a person, a photo, a website, an EVM account / address, an ENS (Ethereum Name Service) address, etc. Their data typically takes the form of: an IPFS hash to their JSON data, an EVM address, URL, or an ENS address. The format that the JSON takes is typically something like:

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

## Triples

Triples are the main form of a *claim* made on Intuition. Triples specifically **consist of three sequential atoms**. These are labeled the *subject*, *predicate*, and *object* respectively. These claims can be read sequentially via their `label` field which is derived either from the JSON's `name` field, or URI, address, or ENS name. For example if I have two other atoms with `name` field values `is` and `trustworthy` then we can assemble them to make the claim `Donald J. Trump is trustworthy`.

## Staking

Users are given the opportunity to stake money on a triple either **for** or **against** the composed claim. Both staking and unstaking incur fees from the smart contract. This added "weight" to each claim can help give it more visibility, and gives the network more statistical data to work with.