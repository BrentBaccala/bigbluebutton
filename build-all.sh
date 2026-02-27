#!/bin/bash
# Build all BBB packages sequentially, reporting results

cd "$(dirname "$0")"

PACKAGES=(
    bbb-apps-akka
    bbb-config
    bbb-etherpad
    bbb-export-annotations
    bbb-freeswitch-core
    bbb-freeswitch-sounds
    bbb-fsesl-akka
    bbb-html5-nodejs
    bbb-html5
    bbb-learning-dashboard
    bbb-libreoffice-docker
    bbb-lti
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
    bbb-webrtc-sfu
    bbb-webrtc-recorder
    bigbluebutton
)

SUCCEEDED=()
FAILED=()

for PKG in "${PACKAGES[@]}"; do
    echo "=========================================="
    echo "Building: $PKG"
    echo "=========================================="
    if ./build/setup-nosudo.sh "$PKG"; then
        echo "SUCCESS: $PKG"
        SUCCEEDED+=("$PKG")
    else
        echo "FAILED: $PKG"
        FAILED+=("$PKG")
    fi
    echo ""
done

echo "=========================================="
echo "BUILD SUMMARY"
echo "=========================================="
echo "Succeeded (${#SUCCEEDED[@]}/${#PACKAGES[@]}):"
for PKG in "${SUCCEEDED[@]}"; do
    echo "  OK  $PKG"
done
if [ ${#FAILED[@]} -gt 0 ]; then
    echo "Failed (${#FAILED[@]}/${#PACKAGES[@]}):"
    for PKG in "${FAILED[@]}"; do
        echo "  FAIL  $PKG"
    done
fi
echo ""
echo "Artifacts:"
ls -la artifacts/*.deb 2>/dev/null || echo "  No .deb files found"
