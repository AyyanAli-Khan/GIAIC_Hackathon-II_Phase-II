# Data Model: Todo Backend API

**Branch**: `001-todo-backend-api` | **Date**: 2026-02-07

## Entities

### Todo (database table)

| Field        | Python Type          | SQL Type                 | Constraints                |
|--------------|----------------------|--------------------------|----------------------------|
| id           | uuid.UUID            | UUID                     | PK, default=uuid4          |
| title        | str                  | VARCHAR(500)             | NOT NULL, min_length=1     |
| description  | str \| None          | VARCHAR(2000)            | NULLABLE, default=None     |
| is_completed | bool                 | BOOLEAN                  | NOT NULL, default=False    |
| user_id      | str                  | VARCHAR(255)             | NOT NULL, INDEX            |
| created_at   | datetime             | TIMESTAMP WITH TIME ZONE | NOT NULL, default=now()    |
| updated_at   | datetime             | TIMESTAMP WITH TIME ZONE | NOT NULL, auto-update      |

### SQLModel Classes

```
Todo (table=True)         — Database table model
TodoCreate                — Request schema for POST (title required, description/is_completed optional)
TodoUpdate                — Request schema for PATCH (all fields optional)
TodoPublic                — Response schema (excludes user_id)
```

### Indexes

| Index Name                    | Columns                    | Purpose                        |
|-------------------------------|----------------------------|--------------------------------|
| ix_todo_user_id               | user_id                    | Filter todos by owner          |
| ix_todo_user_id_created_at    | (user_id, created_at DESC) | List todos sorted by creation  |

## Relationships

- **Todo → User**: Many-to-one via `user_id` (string FK to JWT `sub` claim). No User table exists in the backend database; user identity is derived from the JWT on every request.

## State Transitions

```
Todo lifecycle:
  Created (is_completed=false)
    → Updated (title/description/is_completed changed)
    → Deleted (hard delete, row removed)
```

No soft-delete. Deletion is permanent.

## Validation Rules

| Field        | Rule                                        |
|--------------|---------------------------------------------|
| title        | 1-500 chars, required on create             |
| description  | 0-2000 chars, optional, nullable            |
| is_completed | boolean, default false on create            |
| user_id      | Set from JWT sub, never from request body   |
| created_at   | Set once at creation, immutable             |
| updated_at   | Auto-updated on every modification          |
