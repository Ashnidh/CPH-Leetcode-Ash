import subprocess
import sys

def first_function():
    sourceCode = sys.argv[2]
    infile = open(sys.argv[3], "r")
    infile_contents = infile.read()
    infile.close()

    p = subprocess.Popen('python -u '+sourceCode,
                        stdin=subprocess.PIPE,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        shell=True
                        )

    out, err = p.communicate(input=infile_contents.encode().strip())

    if p.returncode != 0:
        print(err)
    out = out.decode("utf-8")
    out = out.strip()
    print(out)


if sys.argv[1] == 'first_function':
    first_function()

sys.stdout.flush()


