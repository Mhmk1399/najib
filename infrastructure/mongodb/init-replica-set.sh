#!/bin/sh
set -eu

until mongosh --host mongodb:27017 --quiet --eval 'db.adminCommand("ping")' >/dev/null 2>&1; do
  sleep 2
done

mongosh --host mongodb:27017 --quiet --eval '
  try {
    if (rs.status().ok === 1) {
      quit(0);
    }
  } catch (error) {
    // The replica set has not been initialized yet.
  }

  const result = rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
  });

  if (result.ok !== 1) {
    printjson(result);
    quit(1);
  }
' 

