#!/bin/sh
# @desc used in debug mode for build & update WebUiCore library
# @since 2021.01.18, 20:49
# @changed 2021.01.18, 23:58

basedir=`realpath .`

echo "Updating WebUiCore library (for '$basedir')..."

cd "../WebUiCore" \
  && sh util-update-build-variables.sh \
  && npm run -s build \
  && sh util-publish-update-debug.sh "$basedir" \
  && cd "$basedir" \
  && echo OK
