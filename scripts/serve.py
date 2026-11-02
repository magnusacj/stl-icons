"""Serve the add-in locally for previewing in a browser.

Usage:  python scripts/serve.py [port]
Then open http://localhost:3000/taskpane.html

PowerPoint itself needs the add-in on HTTPS - see README.md.
"""
import functools
import http.server
import sys
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent / 'app'
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(APP_DIR))
with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler) as server:
    print(f'Serving {APP_DIR} at http://localhost:{PORT}/taskpane.html')
    server.serve_forever()
