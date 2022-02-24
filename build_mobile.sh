#!/bin/bash

MOBILE_CONFIG=./public/config.json

if test -f "$MOBILE_CONFIG"; then
    echo -e "\033[0;32m$MOBILE_CONFIG found."
else 
    echo -e "\033[0;31mrequired file $MOBILE_CONFIG not found, aborting.\n"
	exit 1
fi

VUE_APP_MOBILE_CONFIG=$(< $MOBILE_CONFIG) vue-cli-service build
