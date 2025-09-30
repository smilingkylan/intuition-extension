# Create Social Atom

When a user navigates to X.com the X.com plugin observes the user's behavior and sends Tweet data to the sidepanel where it can display related Intuition data (ie atoms and triples) and be used to populate the Intuition knowledge graph. Specifically, the following atoms and triples can be made:

1. Atom representing the social media account
2. Atom representing the profile picture from the social media account
3. Triple connecting the profile picture to the social media account with `has related image` atom as predicate

If the user knows the social media account's real-world identity then they can also create the following

4. Atom representing the real-world identity of the user
5. Triple connecting the real-world identity to the profile image with `has related image`
6. Triple connecting the real-world identity to the social media profile with `owns` atom as predicate

This means we will have to ask the user if they know the real-world identity of the user BEFORE submitting the first transaction, since a real-world identity atom will have to be created. Atoms will be created with `createAtoms` and `createTriples` will be used afterwards with some of the created atom IDs returned for input.