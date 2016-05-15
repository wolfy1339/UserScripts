#!/usr/bin/python
# Script taken from https://github.com/CorsixTH/CorsixTH/blob/master/scripts/check_trailing_whitespaces.py
# Modified it to fit the needs of this project
"""
  Usage: check_trailing_whitespaces.py [root]
  This script will check the presence of trailing whitespaces in any file
  below |root|. It will return 0 if none is found. Otherwise, it will print the
  path of the violating file and return an error code.
  If root is not specified, it will use the current directory.
"""

import fileinput
import os
import re
import sys

def has_trailing_whitespaces(path):
    """ Returns whether |path| has trailing whitespaces. """
    handle = open(path, 'r')
    for line in handle:
    for idx in range(-1, -len(line) - 1, -1):
        if line[idx] in ('\n', '\r'):
            continue
        if line[idx] in (' ', '\t'):
            handle.close()
            return True
        break
    handle.close()
  return False

if len(sys.argv) > 2:
    sys.exit('Usage: ' + sys.argv[0] + ' [root]')

top = os.getcwd()
if len(sys.argv) == 2:
    top += '/' + sys.argv[1]

for root, dirs, files in os.walk(top):
    for f in files:
        if f.endswith('.py') or f.endswith('.user.js') or f.endswith('.travis.yml') or f.endswith('.md'):
            path = root + '/' + f
            if has_trailing_whitespaces(path):
                sys.exit('Found a file with trailing whitespaces: ' + path)

sys.exit(0)
