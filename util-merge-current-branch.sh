#!/bin/sh
# @desc Merging specified branch to dev
# @since 2020.05.27, 13:54
# @changed 2020.05.27, 13:54

TARGET_BRANCH="dev"

BRANCH=`git branch --show-current`

# If no arguments specified...
if [ $# -ne 1 ]; then
  echo "Merging current branch to target branch"
  echo "Usage: $0 <TARGET_BRANCH>"
  echo "Current branch is $BRANCH"
  exit 1
fi

TARGET_BRANCH="$1"

sh util-merge-branch.sh "$BRANCH" "$TARGET_BRANCH"
