from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        """Fetch a user by email."""
        return (
            self.db.query(User)
            .filter(User.email == email.lower().strip())
            .first()
        )

    def get_by_id(self, user_id: UUID) -> User | None:
        """Fetch a user by ID."""
        return (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def create(
        self,
        email: str,
        full_name: str | None = None,
    ) -> User:
        """Create a new user."""
        user = User(
            email=email.lower().strip(),
            full_name=full_name,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def update(self, user: User, **kwargs) -> User:
        """Update allowed user fields."""
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete(self, user: User) -> None:
        """Delete a user."""
        self.db.delete(user)
        self.db.commit()