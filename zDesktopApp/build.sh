 #!/bin/bash 
 
py2applet --make-setup soundsPink.py

rm -rf build dist

python3 setup.py py2app