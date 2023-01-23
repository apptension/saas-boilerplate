FROM segment/chamber:2 AS chamber
FROM alpine

RUN apk --no-cache add bash ca-certificates jq moreutils

COPY --from=chamber /chamber /bin/chamber

RUN mkdir -p /scripts
COPY scripts /scripts
RUN chmod a+x /scripts/*

ENTRYPOINT ["/bin/bash", "/scripts/run.sh"]
