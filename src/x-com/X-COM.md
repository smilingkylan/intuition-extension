# X.com Intended Functionality

## Background

This X.com plugin is intended for use within the Intuition Extension. Its purpose is to detect a user's intent to learn more about a topic (eg person, EVM address, URL, etc) and send a query to the Intuition network to display any relevant insights in the extension's UI (typically the side panel).

## Anatomy

This feature is composed of a content script which is enabled on X.com webpages and detects Tweets (via their `<article>` tags) and scrapes their HTML for relevant data like `username`, `description`, `avatarURL`. This data can be used to create relevant atoms, or query for related atoms and triples / claims to display in the extension's UI.

## Mechanism

1. The scraped tweet data is used to create an atom for the X account. It look like the following:

```
  "@type": "Thing",
  "@context": "https://schema.org",
  "name": "x.com:elonmusk",
  "avatarURL": "https://x.com/somepath/file.jpg",
  "description": "[Description from the X.com account]",
```

2. Once created, everytime an extension user mouses over* a Tweet by the X.com user @elonmusk it will trigger a query that will return the atom and any claims related to it.

* The "focus" mechanism may be changed in the future

3. While displaying related atoms and claims for a specific X.com account the user will be prompted to link the X.com account to the real-world identity behind the account. If the user starts the process they will be taken to a multi-step process that will create an atom like the following:

```
  "@type": "Person",
  "@context": "https://schema.org",
  "name": "Elon Musk"
  "description": "International businessman, entrepreneur, technologist, and former head of DOGE",
```

This will then be connected to the `x:com:elonmusk` atom via an `owns` or `owns X.com account` (which?) atom that may look something like the following:

```
"@type": "Thing",
"@context": "https://schema.org",
"name": "owns",
"description": "have (something) as one's own; possess"
```

The assembled triple will look like `Elon Musk` `owns` `x.com:elonmusk` or `Elon Musk` `owns X.com account` `x.com:elonmusk`. This creates the relationship between the person and the X.com account.

Note: in the former situation we can use generic `owns` atom, in second one we would need each plugin to define the related atom so former may be better(?)

4. With the real-world identity now tied to the X.com account we can display information like atoms or triples related to said real-world identity. This real-world identity can be used similarly on other websites. In this way the real-world identities will estbalisht Intuition's reputation layer as being internet-wide and not just isolated to one app. Sentiment about real people can be sourced from multiple apps / interfaces which will give a better picture of the person as an actual person, rather than just one of their multiple online *profiles*.

5. If an extension user notices that atoms and triples are no longer showing up for an X.com account, it is possible that the user changed their username, thereby breaking the matching criterion. In this case there will be an atom that we can use as a predicate to link the old and new X.com usernames. It will look someting like this:

```
"@type": "Thing",
"@context": "https://schema.org",
"name": "changed to" // or possibly "changed X.com account to"\
...
```

6. With username changes tracked in the Intuition network we can now also display claims for 


- This will disincentivize people from using usernames with bad reputations from the last user. This could be good because it prevents people from using duplicate usernames, but only if they use Intuition... otherwise if there is a strong(?) weight on the Triple claim then the reputation for the username should not be displayed in the sidepanel. But then there is no other atom we can display. **As a result we need to push people to make atoms for the real-world identity.** Unless you specifically only look at ratings done after a certain date (when the `changed to` triple was created) but that isn't realistic.
- So this means that we will want to push extension users to establish the real-world identity...
- - Create atom for X.com account
- - If they know real-world identity then create identity atom (or match existing) and tie them with the "owns" atom. X.com account atom is still needed to bring up real-world atom and claims when the account is viewed by the content script.
- - The problem is that X.com users can still change their usernames often...

- Important people are unlikely to change their usernames just to swerve the Intuition system because losing your checkmark for a while is a massive punishment... but what if that ever changed?
**- Final: Someone should use a claim to notify the plugin that the username has changed (fetch new User ID?). It is trivial to do one HTTP request**

-  It will really push people towards making claims against their real-world personality. Possibly we should start this process off without nudging people to creating real-world atoms and they will eventually realize real-world identity reputations stick better
- You can notify the Intuition network of username changes via a triple `[x.com:elonmusk] changed to [x.com:worldrichestman]` which can 
- Start off for account, then try to establish real-world identity, once established can choose (or just do real)?
- Use AI to link the account to the person