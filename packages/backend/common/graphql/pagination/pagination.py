"""
Taken from: https://github.com/saltycrane/graphene-relay-pagination-example/tree/artsy-example

via
https://www.saltycrane.com/blog/2021/01/graphene-and-relay-example-graphql-pagination-api-and-ui/

"""
import math

from graphql_relay import to_global_id


PREFIX = "arrayconnection"
PAGE_NUMBER_CAP = math.inf


def page_to_cursor(page, size):
    return to_global_id(PREFIX, (page - 1) * size - 1)


def page_cursors_to_array(start, end, current_page, size):
    cursors = []
    for page in range(start, end + 1):
        cursors.append(page_to_cursor_object(page, current_page, size))
    return cursors


# Returns an opaque cursor for a page.
def page_to_cursor_object(page, current_page, size):
    return {
        "cursor": page_to_cursor(page, size),
        "page": page,
        "is_current": current_page == page,
    }


# Returns the total number of pagination results capped to PAGE_NUMBER_CAP.
def compute_total_pages(total_records, size):
    return min(math.ceil(total_records / size), PAGE_NUMBER_CAP)


def create_page_cursors(page_options, total_records, max_pages=5):
    current_page = page_options["page"]
    size = page_options["size"]

    # If max_pages is even, bump it up by 1, and log out a warning.
    if max_pages % 2 == 0:
        max_pages = max_pages + 1

    total_pages = compute_total_pages(total_records, size)

    if total_pages == 0:
        # Degenerate case of no records found.
        page_cursors = {"around": [page_to_cursor_object(1, 1, size)]}
    elif total_pages <= max_pages:
        # Collection is short, and `around` includes page 1 and the last page.
        page_cursors = {"around": page_cursors_to_array(1, total_pages, current_page, size)}
    elif current_page <= math.floor(max_pages / 2) + 1:
        # We are near the beginning, and `around` will include page 1.
        page_cursors = {
            "last": page_to_cursor_object(total_pages, current_page, size),
            "around": page_cursors_to_array(1, max_pages - 1, current_page, size),
        }
    elif current_page >= total_pages - math.floor(max_pages / 2):
        # We are near the end, and `around` will include the last page.
        page_cursors = {
            "first": page_to_cursor_object(1, current_page, size),
            "around": page_cursors_to_array(total_pages - max_pages + 2, total_pages, current_page, size),
        }
    else:
        # We are in the middle, and `around` doesn't include the first or last page.
        offset = math.floor((max_pages - 3) / 2)
        page_cursors = {
            "first": page_to_cursor_object(1, current_page, size),
            "around": page_cursors_to_array(current_page - offset, current_page + offset, current_page, size),
            "last": page_to_cursor_object(total_pages, current_page, size),
        }

    if current_page > 1 and total_pages > 1:
        page_cursors["previous"] = page_to_cursor_object(current_page - 1, current_page, size)

    if current_page < total_pages and total_pages > 1:
        page_cursors["next"] = page_to_cursor_object(current_page + 1, current_page, size)

    return page_cursors
