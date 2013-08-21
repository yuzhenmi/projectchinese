i = input('Enter Chinese: ')
o = ''
for char in i:
    if char == ';':
        o = o.strip('+')
        o += char
    else:
        o += str(ord(char)) + '+'
o = o.strip('+')
print(o)
