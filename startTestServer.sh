# !/bin/bash
# Copy files
ROOT=$(pwd)
echo 'Root folder: ' $ROOT
cd $ROOT
open "http://localhost:8001/test/"
python -m SimpleHTTPServer 8001  > log/http.log 2> log/http.err  & 

