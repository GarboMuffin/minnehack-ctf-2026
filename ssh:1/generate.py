import secrets
import string

alphabet = string.ascii_lowercase + string.ascii_uppercase + string.digits
secure_string = ''.join(secrets.choice(alphabet) for _ in range(24))
print(secure_string)
