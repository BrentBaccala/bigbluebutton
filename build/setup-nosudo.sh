#!/bin/bash -ex

PACKAGE_TO_BUILD="$1"
if [ -z "$PACKAGE_TO_BUILD" ]; then
    set +x
    echo "please provide a package name as first parameter, e.g."
    echo "build/setup-nosudo.sh bbb-freeswitch-core"
    exit 1
fi

cd "$(dirname "$0")"
cd ..

mkdir -p artifacts

DOCKER_IMAGE=$(python3 -c 'import yaml; print(yaml.load(open("./.gitlab-ci.yml"), Loader=yaml.SafeLoader)["default"]["image"])')

LOCAL_BUILD=1
GIT_REV=$(git rev-parse HEAD)
GIT_REV="local-build-${GIT_REV:0:10}"
COMMIT_DATE="$(git log -n1 --pretty='format:%cd' --date=format:'%Y%m%dT%H%M%S')"

if [ ! -z "$FORCE_GIT_REV" ]; then
    GIT_REV=$FORCE_GIT_REV
fi
if [ ! -z "$FORCE_COMMIT_DATE" ]; then
    COMMIT_DATE=$FORCE_COMMIT_DATE
fi

# Run docker directly (no sudo, no detach/attach)
docker run --rm \
        --env GIT_REV=$GIT_REV --env COMMIT_DATE=$COMMIT_DATE --env LOCAL_BUILD=$LOCAL_BUILD \
        --mount type=bind,src="$PWD",dst=/mnt \
        --mount type=bind,src="${PWD}/artifacts",dst=/artifacts \
        "$DOCKER_IMAGE" /mnt/build/setup-inside-docker.sh "$PACKAGE_TO_BUILD"

find artifacts
