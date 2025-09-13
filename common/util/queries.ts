import * as GraphQL from '@/lib/graphql/src/generated'

export const getAtoms = /* GraphQL */ `
  query Atoms(
    $orderBy: [atoms_order_by!] = [{ created_at: desc }]
    $limit: Int = 50
    $offset: Int = 0
    $where: atoms_bool_exp
  ) {
    atoms(order_by: $orderBy, limit: $limit, offset: $offset, where: $where) {
      term_id
      wallet_id
      creator_id
      data
      type
      emoji
      label
      image
      value_id
      block_number
      created_at
      transaction_hash
      term {
        atom_id
        id
        type
        triple_id
        triple {
          subject_id
          predicate_id
          object_id
        }
        vaults(limit: 1) {
          current_share_price
          total_shares
          position_count
          market_cap
          updated_at
        }
      }
      value {
        thing {
          name
          image
          description
        }
        person {
          name
          image
          description
        }
        organization {
          name
          image
          description
        }
      }
      positions_aggregate {
        aggregate {
          count
        }
      }
    }
    atoms_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export const getAtomById = /* GraphQL */ `
  query AtomById($atomId: numeric!) {
    atoms(where: { term: { atom_id: { _eq: $atomId } } }, limit: 1) {
      term_id
      wallet_id
      creator_id
      data
      type
      emoji
      label
      image
      value_id
      block_number
      created_at
      transaction_hash
      term {
        atom_id
        id
        type
        triple_id
        triple {
          subject_id
          predicate_id
          object_id
        }
        vaults(limit: 1) {
          current_share_price
          total_shares
          position_count
          market_cap
          updated_at
        }
      }
      value {
        thing {
          name
          image
          description
        }
        person {
          name
          image
          description
        }
        organization {
          name
          image
          description
        }
      }
      positions_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

export const getTriplesByAtomId = /* GraphQL */ `
  query TriplesByAtomId(
    $atomId: numeric!
    $address: String
    $limit: Int
    $offset: Int
    $order_by: [triples_order_by!]
  ) {
    triples(
      where: {
        _or: [
          { subject_id: { _eq: $atomId } }
          { predicate_id: { _eq: $atomId } }
          { object_id: { _eq: $atomId } }
        ]
      }
      limit: $limit
      offset: $offset
      order_by: $order_by
    ) {
      term_id
      creator_id
      subject_id
      predicate_id
      object_id
      block_number
      transaction_hash
      created_at
      subject {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      predicate {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      object {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      triple_vault {
        term_id
        counter_term_id
        total_assets
        total_shares
        position_count
        market_cap
        updated_at
        term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
        counter_term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
      }
      user_positions: positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
      user_counter_positions: counter_positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
    }
  }
`

export const getTripleById = /* GraphQL */ `
  query TripleById($tripleId: numeric!) {
    triples(where: { term_id: { _eq: $tripleId } }) {
      term_id
      creator_id
      subject_id
      predicate_id
      object_id
      block_number
      created_at
      transaction_hash
      subject {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      predicate {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      object {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      triple_vault {
        term_id
        counter_term_id
        total_assets
        total_shares
        position_count
        market_cap
        updated_at
      }
    }
    vaults: triple_vaults(where: { term_id: { _eq: $tripleId } }, limit: 1) {
      term_id
      counter_term_id
      total_assets
      total_shares
      position_count
      market_cap
      updated_at
    }
    counter_vaults: triple_vaults(
      where: { counter_term_id: { _eq: $tripleId } }
      limit: 1
    ) {
      term_id
      counter_term_id
      total_assets
      total_shares
      position_count
      market_cap
      updated_at
    }
  }
`

export const getTripleVaultPositions = /* GraphQL */ `
  query TripleVaultPositions(
    $tripleId: numeric!
    $orderBy: [positions_order_by!] = [{ shares: desc }]
    $limit: Int = 20
    $offset: Int = 0
  ) {
    triple: triples(where: { term_id: { _eq: $tripleId } }, limit: 1) {
      term_id
      positions(
        where: { shares: { _gt: "0" } }
        order_by: $orderBy
        limit: $limit
        offset: $offset
      ) {
        id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
      }
      counter_positions(
        where: { shares: { _gt: "0" } }
        order_by: $orderBy
        limit: $limit
        offset: $offset
      ) {
        id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
      }
    }
  }
`

export const fetchAtomsByIds = /* GraphQL */ `
  query AtomsByIds($atomIds: [numeric!]!) {
    atoms(where: { term: { atom_id: { _in: $atomIds } } }) {
      term_id
      label
      type
      value {
        thing {
          name
          image
          description
        }
        person {
          name
          image
          description
        }
        organization {
          name
          image
          description
        }
      }
    }
  }
`

export const getTripleSignals = /* GraphQL */ `
  query TripleSignals(
    $tripleId: numeric!
    $orderBy: [signals_order_by!] = [{ created_at: desc }]
    $limit: Int
    $offset: Int
  ) {
    signals(
      where: { triple_id: { _eq: $tripleId } }
      order_by: $orderBy
      limit: $limit
      offset: $offset
    ) {
      id
      account_id
      delta
      created_at
      block_number
      transaction_hash
      triple_id
      atom_id
      deposit_id
      redemption_id
      account {
        id
        label
        image
      }
    }
  }
`

export const getRankingsWhereClause = (
  atomIds: [number | null, number | null, number | null]
) => {
  const conditions: any[] = []

  // Add condition for subject_id if not null
  if (atomIds[0] !== null) {
    conditions.push({ subject_id: { _eq: atomIds[0] } })
  }

  // Add condition for predicate_id if not null
  if (atomIds[1] !== null) {
    conditions.push({ predicate_id: { _eq: atomIds[1] } })
  }

  // Add condition for object_id if not null
  if (atomIds[2] !== null) {
    conditions.push({ object_id: { _eq: atomIds[2] } })
  }

  // Return appropriate where clause structure
  if (conditions.length === 0) {
    return {} // No filtering - return all triples
  }

  if (conditions.length === 1) {
    return conditions[0] // Single condition
  }

  return { _and: conditions } // Multiple conditions combined with AND
}

export const getTriplesRankingsQueryWithWhereClause = (
  atomIds: [number | null, number | null, number | null],
  address?: string
) => {
  const whereClause = getRankingsWhereClause(atomIds)
  console.log('whereClause', whereClause)
  return {
    query: getTriplesRankingsQuery,
    variables: {
      whereClause,
      ...(address && { address }),
    },
  }
}

export const getTriplesRankingsQuery = /* GraphQL */ `
  query TriplesRankings(
    $whereClause: triples_bool_exp
    $address: String = ""
    $orderBy: [triples_order_by!] = [{ created_at: desc }]
    $limit: Int = 20
    $offset: Int = 0
  ) {
    triples(
      where: $whereClause
      order_by: $orderBy
      limit: $limit
      offset: $offset
    ) {
      term_id
      creator_id
      subject_id
      predicate_id
      object_id
      block_number
      transaction_hash
      created_at
      subject {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      predicate {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      object {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      triple_vault {
        term_id
        counter_term_id
        total_assets
        total_shares
        position_count
        market_cap
        updated_at
        term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
        counter_term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
      }
      user_positions: positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
      user_counter_positions: counter_positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
    }
  }
`

export const getUnstakePositionDataQuery = /* GraphQL */ `
  query UnstakePositionData($positionId: String!) {
    position(id: $positionId) {
      ...PositionDetails
    }

    triple(term_id: $tripleId) {
      ...TripleMetadata
      ...TripleTxn
    }
  }
`
export const getUserPositionOnTripleQuery = /* GraphQL */ `
  query GetUserPositionOnTriple($tripleId: numeric!, $address: String!) {
    # Get the triple to find both vault term IDs
    triple: triples(where: { term_id: { _eq: $tripleId } }, limit: 1) {
      term_id
      triple_vault {
        term_id
        counter_term_id
      }

      # User positions on supporting side (positions)
      user_positions: positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        account_id
        shares
        created_at
        vault {
          term_id
          current_share_price
          total_shares
        }
      }

      # User positions on opposing side (counter_positions)
      user_counter_positions: counter_positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        account_id
        shares
        created_at
        vault {
          term_id
          current_share_price
          total_shares
        }
      }
    }
  }
`

export const checkTripleExistsByEvmAddress = /* GraphQL */ `
  query CheckTripleExistsByEvmAddress(
    $label: String!
    $predicateId: numeric!
    $objectId: numeric!
  ) {
    triples(
      where: {
        subject: { label: { _eq: $label } }
        predicate_id: { _eq: $predicateId }
        object_id: { _eq: $objectId }
      }
      limit: 1
    ) {
      term_id
      created_at
      subject {
        term_id
        label
        data
        type
      }
      predicate {
        term_id
        label
      }
      object {
        term_id
        label
      }
    }
  }
`

export const getTriplesWithPagination = /* GraphQL */ `
  query GetTriplesWithPagination(
    $limit: Int = 20
    $offset: Int = 0
    $address: String = ""
    $orderBy: [triples_order_by!] = [{ created_at: desc }]
  ) {
    triples_aggregate {
      aggregate {
        count
      }
    }
    triples(limit: $limit, offset: $offset, order_by: $orderBy) {
      term_id
      creator_id
      subject_id
      predicate_id
      object_id
      block_number
      transaction_hash
      created_at
      subject {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      predicate {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      object {
        term_id
        creator_id
        data
        type
        emoji
        label
        image
        value {
          thing {
            name
            image
            description
          }
          person {
            name
            image
            description
          }
          organization {
            name
            image
            description
          }
        }
      }
      triple_vault {
        term_id
        counter_term_id
        total_assets
        total_shares
        position_count
        market_cap
        updated_at
        term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
        counter_term {
          vaults(limit: 1) {
            current_share_price
            total_shares
            position_count
            market_cap
            updated_at
          }
        }
      }
      user_positions: positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
      user_counter_positions: counter_positions(
        where: { account_id: { _eq: $address }, shares: { _gt: "0" } }
      ) {
        id
        term_id
        account_id
        shares
        created_at
        account {
          id
          label
          image
        }
        vault {
          term_id
        }
      }
    }
  }
`