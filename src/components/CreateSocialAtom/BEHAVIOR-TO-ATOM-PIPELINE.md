# Behavior-to-Atom Pipeline

Browse vs Watch

## Background

The primary role of the Intuition Extension is to facilitate the creation of new atoms and triples, as well as display atoms and triples that are relevant to the user's current browsing activity.

When browsing the internet the vendor plugin (X.com in this case) the plugin sends two pieces of data to the rest of the extension:
1. A query that will be used as the search term that will try to match atoms with a `label` field that matches the query. eg `x.com:23493070193`, `yahoo.com`, `www.yahoo.com`, `0x1234...`, `eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb`, etc
2. Data about the object being queried for, for the purpose of creating an atom for said object it if does not yet exist

It is important to remember that any *current* browsing activity could be related to multiple atoms or triples. For example: the user may be reading a Tweet that could have its own atom and its author could have their own atom, and a separate atom may be relevant that is related to the URL where the user is browsing, or the user could highlight an EVM address which has multiple formats and therefore multiple potential queries or query results.

Keep in mind that we need to have the option to create an atom for an object if one does not exist. So, rather than displaying nothing maybe we should show a preview(?) of what the atom would look like if created but presented differently (ie no stats and possibly adjusted border or opacity, etc). Both cases should use AtomDisplay and adjust accordingly.

Perhaps the Dashboard should be presented as a queue, with atom or potential atom being inserted at the top and gradually being pushed downward by subsequent queries. If a query has multiple matching atoms then what to do in that case?