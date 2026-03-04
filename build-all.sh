#!/bin/bash

# Build all BigBlueButton v3.0.14 packages
# bigbluebutton meta-package is built last

PACKAGES=(
    bbb-apps-akka
    bbb-config
    bbb-etherpad
    bbb-export-annotations
    bbb-freeswitch-core
    bbb-freeswitch-sounds
    bbb-fsesl-akka
    bbb-graphql-actions
    bbb-graphql-middleware
    bbb-graphql-server
    bbb-html5
    bbb-learning-dashboard
    bbb-libreoffice-docker
    bbb-livekit
    bbb-mkclean
    bbb-pads
    bbb-playback
    bbb-playback-notes
    bbb-playback-podcast
    bbb-playback-presentation
    bbb-playback-screenshare
    bbb-playback-video
    bbb-record-core
    bbb-transcription-controller
    bbb-web
    bbb-webhooks
    bbb-webrtc-recorder
    bbb-webrtc-sfu
    bigbluebutton
)

SUCCEEDED=()
FAILED=()

START_TIME=$(date +%s)

for pkg in "${PACKAGES[@]}"; do
    echo ""
    echo "========================================"
    echo "Building: $pkg"
    echo "========================================"
    PKG_START=$(date +%s)
    if ./build/setup-nosudo.sh "$pkg"; then
        PKG_END=$(date +%s)
        echo "SUCCESS: $pkg ($(( PKG_END - PKG_START ))s)"
        SUCCEEDED+=("$pkg")
    else
        PKG_END=$(date +%s)
        echo "FAILED: $pkg ($(( PKG_END - PKG_START ))s)"
        FAILED+=("$pkg")
    fi
done

END_TIME=$(date +%s)

echo ""
echo "========================================"
echo "Build Summary"
echo "========================================"
echo "Total time: $(( END_TIME - START_TIME ))s"
echo ""
echo "Succeeded (${#SUCCEEDED[@]}/${#PACKAGES[@]}):"
for pkg in "${SUCCEEDED[@]}"; do
    echo "  + $pkg"
done
echo ""
if [ ${#FAILED[@]} -gt 0 ]; then
    echo "Failed (${#FAILED[@]}/${#PACKAGES[@]}):"
    for pkg in "${FAILED[@]}"; do
        echo "  - $pkg"
    done
fi
