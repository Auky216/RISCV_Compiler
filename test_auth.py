import sys
sys.path.append('api')
from auth import create_jwt
from database import init_db, create_or_update_user
from models.user import UserCreate

init_db()
user_data = UserCreate(google_id="123", email="test@test.com", name="Test")
user = create_or_update_user(user_data)
token = create_jwt(user.id)
print(token)
