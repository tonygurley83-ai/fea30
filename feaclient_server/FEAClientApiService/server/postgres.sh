#!/data/data/com.termux/files/usr/bin/bash

pg_ctl \
  -D $PREFIX/var/lib/postgresql \
  -l $PREFIX/var/lib/postgresql/postgresql.log \
  start

tail -f $PREFIX/var/lib/postgresql/postgresql.log
