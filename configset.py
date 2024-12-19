import base64
import json
from dotenv import set_key

def escape_special_chars(value):
    # Replace \ with \\ to escape all backslashes
    value = value.replace("\\", "\\\\")
    return value

def unescape_special_chars(value):
    # Replace \\ with \ to revert back to original state
    value = value.replace("\\\\", "\\")
    return value

def to_uint8_and_base64(value):
    if isinstance(value, dict):
        # Encode nested JSON objects
        return {k: to_uint8_and_base64(v) for k, v in value.items()}
    elif isinstance(value, list):
        # Encode lists within JSON objects
        return [to_uint8_and_base64(v) for v in value]
    else:
        escaped_value = escape_special_chars(value)
        uint8_data = escaped_value.encode('utf-8')
        base64_encoded = base64.b64encode(uint8_data).decode('utf-8')
        return base64_encoded

def from_base64_to_uint8(encoded_value):
    if isinstance(encoded_value, dict):
        return {k: from_base64_to_uint8(v) for k, v in encoded_value.items()}
    elif isinstance(encoded_value, list):
        return [from_base64_to_uint8(v) for v in encoded_value]
    else:
        uint8_data = base64.b64decode(encoded_value.encode('utf-8'))
        original_value = uint8_data.decode('utf-8')
        unescaped_value = unescape_special_chars(original_value)
        return unescaped_value

# Đọc file config.json
with open('config.json', 'r') as file:
    config_data = json.load(file)

# Mã hóa các giá trị
encoded_config_data = {key: to_uint8_and_base64(value) if isinstance(value, (str, dict, list)) else value for key, value in config_data.items()}

# # Ghi file configEncode.json
# with open('configEncode.json', 'w') as file:
#     json.dump(encoded_config_data, file, indent=4)

# Giải mã các giá trị
decoded_config_data = {key: from_base64_to_uint8(value) if isinstance(value, (str, dict, list)) else value for key, value in encoded_config_data.items()}

# # Ghi file configDecode.json
# with open('configDecode.json', 'w') as file:
#     json.dump(decoded_config_data, file, indent=4)

# Ghi file './functions/src/certificates/config.json'
with open('./functions/src/certificates/config.json', 'w') as file:
    json.dump(decoded_config_data["certificates"], file, indent=4)

# Ghi file './functions/dev.env'
with open('./dev.env', 'w') as env_file:
    for key, value in decoded_config_data["develop"].items():
        env_file.write(f'{key}={value}\n')

# Ghi file './functions/prod.env'
with open('./prod.env', 'w') as env_file:
    for key, value in decoded_config_data["production"].items():
        env_file.write(f'{key}={value}\n')

# Ghi file './functions/prod.env'
with open('./functions/.env', 'w') as env_file:
    for key, value in decoded_config_data["production"].items():
        env_file.write(f'{key}={value}\n')

print("Config data has been encoded and decoded set app config successfully!")
