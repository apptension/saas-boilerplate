from graphql_relay import from_global_id


# forked from
# https://github.com/artsy/metaphysics/blob/11bcc29569e3a9bd9a8f9b2f0a31af1e65e88986/src/lib/helpers.ts#L90-L104
# (removed `gravityArgs` because it doesn't seem to be needed for this use case)
def convert_connection_args_to_page_options(connection_args):
    paging_params = get_paging_parameters(connection_args)
    size = paging_params.get("limit")
    offset = paging_params.get("offset")
    # If a size of 0 explicitly requested, it doesn't really matter what
    # the page is.
    page = round((size + offset) / size) if size else 1
    return {"page": page, "size": size}


# ported from
# https://github.com/darthtrevino/relay-cursor-paging/blob/177eca6975ef7cd602caf2f92edbeed00cabf3b9/src/getPagingParameters.ts
def get_paging_parameters(args):
    [is_forward_paging, is_backward_paging] = check_paging_sanity(args)
    first = args.get("first")
    last = args.get("last")
    after = args.get("after")
    before = args.get("before")

    def get_id(cursor):
        _, _id = from_global_id(cursor)
        return int(_id)

    def next_id(cursor):
        return get_id(cursor) + 1

    if is_forward_paging:
        return {"limit": first, "offset": next_id(after) if after else 0}
    elif is_backward_paging:
        limit = last
        offset = get_id(before) - last

        # Check to see if our before-page is underflowing past the 0th item
        if offset < 0:
            # Adjust the limit with the underflow value
            limit = max(last + offset, 0)
            offset = 0

        return {"limit": limit, "offset": offset}
    else:
        return {}


# ported from
# https://github.com/darthtrevino/relay-cursor-paging/blob/177eca6975ef7cd602caf2f92edbeed00cabf3b9/src/checkPagingSanity.ts
def check_paging_sanity(args):
    first = args.get("first")
    last = args.get("last")
    after = args.get("after")
    before = args.get("before")
    is_forward_paging = bool(first) or bool(after)
    is_backward_paging = bool(last) or bool(before)

    if is_forward_paging and is_backward_paging:
        raise Exception("cursor-based pagination cannot be forwards AND backwards")
    if is_forward_paging and before or is_backward_paging and after:
        raise Exception("paging must use either first/after or last/before")
    if is_forward_paging and first < 0 or is_backward_paging and last < 0:
        raise Exception("paging limit must be positive")
    # This is a weird corner case. We'd have to invert the ordering of query to
    # get the last few items then re-invert it when emitting the results. We'll
    # just ignore it for now.
    if last and not before:
        raise Exception("when paging backwards, a 'before' argument is required")

    return [is_forward_paging, is_backward_paging]
