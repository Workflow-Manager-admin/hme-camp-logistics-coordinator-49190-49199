#!/bin/bash
cd /home/kavia/workspace/code-generation/hme-camp-logistics-coordinator-49190-49199/camp_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

