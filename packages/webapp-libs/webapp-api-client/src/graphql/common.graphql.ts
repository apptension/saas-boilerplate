import { gql } from '.';

export const pageCursorsFragment = gql(/* GraphQL */ `
  fragment pageCursorsFragment on PageCursors {
    around {
      cursor
      isCurrent
      page
    }
    first {
      cursor
      isCurrent
      page
    }
    last {
      cursor
      isCurrent
      page
    }
    next {
      cursor
      isCurrent
      page
    }
    previous {
      cursor
      isCurrent
      page
    }
  }
`);
