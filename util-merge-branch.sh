#!/bin/sh
# @desc Merging specified branch to dev
# @since 2020.05.25, 19:26
# @changed 2020.05.25, 19:26

TARGET_BRANCH="dev"

# If no arguments specified...
if [ $# -lt 1 ]; then
  echo "Merging specified branch to target branch"
  echo "Usage: $0 <BRANCH> [<TARGET_BRANCH>]"
  echo "Default target branch is $TARGET_BRANCH"
  echo "Available branches:"
  git --no-pager branch --sort=committerdate
  CURRENT_BRANCH=`git branch --show-current`
  echo "Current branch is $CURRENT_BRANCH"
  exit 1
fi

BRANCH=$1

# Target branch specified
if [ $# -eq 2 ]; then
  TARGET_BRANCH="$2"
fi

if [ "$BRANCH" = "$TARGET_BRANCH" ]; then
  echo "The source branch must be different from target branch ($TARGET_BRANCH)"
  exit 1
fi

echo "Merging branch $BRANCH to $TARGET_BRANCH" && \
  git checkout $TARGET_BRANCH && \
  git pull && \
  git merge $BRANCH && \
  git push && \
  git checkout $BRANCH && \
  echo "Ok"
