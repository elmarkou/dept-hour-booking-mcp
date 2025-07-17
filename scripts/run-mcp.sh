#!/bin/bash
docker-compose build --quiet dept-hourbooking >/dev/null 2>&1
exec docker-compose run --rm -T -i --service-ports dept-hourbooking node ./lib/src/index.js