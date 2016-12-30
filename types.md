# Interfaces

## Announcement

```javascript
interface Announcement {
  uuid: string;
  title: string;
  isbn: string;
  subject: string;
  edition: string;
  grade: string;
  notes: string;
  price: number;
  phone: string;
  city: string;
  updatedAt: Date;
  createdAt: Date;
}
```

```javascript
interface ShortAnnouncement {
  uuid: string;
  title: string;
  isbn: string;
  subject: string;
  notes: string;
  price: number;
  phone: string;
}
```

## User

```javascript
interface User {
  uuid: string;
  name: string;
  phone: string;
  city: string;
}
```
