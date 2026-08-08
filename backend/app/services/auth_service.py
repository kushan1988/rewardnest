from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.repositories.user_repository import UserRepository
from uuid import UUID


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def login(self, email: str, full_name: str):
        """
        Login or register a user using email.
        """

        email = email.strip().lower()
        full_name = full_name.strip()

        if not email:
            raise ValueError("Email is required.")

        user = self.user_repository.get_by_email(email)

        if not user:
            user = self.user_repository.create(
                email=email,
                full_name=full_name,
            )
        elif not user.full_name:
            user = self.user_repository.update(
                user,
                full_name=full_name,
            )

        token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
            }
        )

        return {
            "user": user,
            "access_token": token,
            "token_type": "bearer",
        }

    def get_user_by_id(self, user_id: UUID):
        return self.user_repository.get_by_id(user_id)