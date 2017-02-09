find . -iname "*.pyc" -type f -exec rm {} \;
find . -iname "__pycache__" -type d -exec rm -r {} \;

