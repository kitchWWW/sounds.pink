rm -rf build dist soundsPink.spec __pycache__

pyinstaller --windowed soundsPink.py

python TCLChanger/TCLChanger.py