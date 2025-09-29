# Extension Architecture

This extension is split into three main parts:

1. **Background script**: maintains connection to Web3 wallet and persists info (especially about our wallet connection so that it can be used by the UI to connect to the wallet)
2. **Content scripts**: scripts that operate on targeted URLs and react to user behavior to try to discern what type of information the user may want from the Intuition system. The hope is to allow third-party developers to write self-contained content scripts for specifics websites (ie *domains*). For example notifying the extension of the following:
   - which YouTube channel a user is browsing
   - which Tweet they are reading
   - which EVM address they are planning to send money to
   - which smart contract they are about to interact with
   - which Spotify song a user is listening to
These requests will come in the form of queries that the extension sends to a GraphQL node, then displays any relevant results in the sidepanel.
3. **Sidepanel**: main UI component used for displaying *relevant* Intuition insights and facilitating contract interactions like creating atoms and triples, or (un)staking. Since sidepanels are not persistent, transaction creation will use an ad-hoc wallet connection initialized with the wallet state persisted by the background script.

## Plug-ins

As mentioned earlier the idea is to allow third-party developers to build their own content scripts as `npm` modules that can be plugged in to Intuition Extension. These plugins can be enabled by the extension to play the role of **sending atom / triple queries to the sidepanel** where relevant insights and actions can be shown. Since content scripts are enabled on a per-URL basis we can cleanly separate the different modules based on which website(s) they operate on top of.

More information about developing an Intuition Extension plugin coming out in the coming weeks