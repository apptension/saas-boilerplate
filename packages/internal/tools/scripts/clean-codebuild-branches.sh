#!/bin/bash

set -eu

git remote add codecommit "$CODE_COMMIT_REPO"

git ls-remote codecommit --heads 'refs/heads/*' | while read line; do
    branch_name=$(echo "${line}" | awk '{print $2}' | sed s/"refs\/heads\/"//)
    origin_branch=$(git ls-remote origin --heads "refs/heads/${branch_name}")

    if [ -z "${origin_branch}" ] ; then
      echo "Deleting branch: $branch_name"
      git branch -D codecommit "$branch_name"
    else
      echo "Keeping branch: $branch_name"
    fi
done
