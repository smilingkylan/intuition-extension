# Create Social Atom

This should ONLY be the process for X.com Tweet atoms (ie query of `x.com:someUserID` or that match a type in the data sent to the extension via `chrome.runtime.sendMessage`)

When a user navigates to X.com the X.com plugin observes the user's behavior and sends Tweet data to the sidepanel where it can display related Intuition data (ie atoms and triples) and be used to populate the Intuition knowledge graph. Specifically, the following atoms and triples can be made:

1. Atom representing the social media account via its user ID
2. Atom representing the profile picture from the social media account, where the atom's `url` and `image` values should both be set to the Twitter user's avatar URL
3. Triple connecting the profile picture to the social media account with `has related image` atom (`HAS_RELATED_IMAGE_VAULD_ID` from chain config) as predicate

If the user knows the social media account's real-world identity then they can also create the following.

4. Atom representing the real-world identity of the user including user-input `name` and `description` and `@type: "Person"`
5. Triple connecting the real-world identity to the profile image with `has related image`
6. Triple connecting the real-world identity to the social media profile with `owns` atom as predicate (`OWNS_ATOM_ID`)

This means we will have to ask the user if they know the real-world identity of the user BEFORE submitting the first transaction, since a real-world identity atom will have to be created. Atoms will be created with `createAtoms` and `createTriples` will be used afterwards with some of the created atom IDs returned for input to help compose the triples.