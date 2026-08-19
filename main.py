import capnp

user_schema = capnp.load("user.capnp")

user = user_schema.User.new_message()

user.id = 123
user.name = "Kevin"
user.email = "kevin@example.com"

data = user.to_bytes()

print("Serialized bytes:", data)
print("Size:", len(data))

with user_schema.User.from_bytes(data) as decoded:
    print(decoded.id)
    print(decoded.name)
    print(decoded.email)