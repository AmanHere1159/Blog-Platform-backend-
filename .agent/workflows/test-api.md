---
description: How to test all Blog Platform API endpoints using cURL (or any HTTP client like Postman/Thunder Client). Covers the full authentication flow, blog operations, comments, and error handling.
---

# Testing API Endpoints

## Prerequisites

1. Ensure MongoDB is running and accessible via the `MONGO_URI` in `.env`.
2. Start the dev server:
// turbo
```bash
npm run dev
```
3. The server runs on `http://localhost:5004`. All routes are prefixed with `/Blogs`.
4. These examples use **cURL**. Adapt the syntax for Postman/Thunder Client as needed.

> **Cookie Handling:** This API uses JWT stored in a cookie named `tokenis`.
> In cURL, use `-c cookies.txt` to save cookies and `-b cookies.txt` to send them.
> In Postman, cookies are managed automatically per domain.

---

## 1. Health Check (Public)

Verify the server is running.

```bash
curl http://localhost:5004/Blogs/get
```

**Expected Response:**
```
get request this is
```

---

## 2. Signup (Public)

Register a new user. The response sets the `tokenis` cookie automatically.

```bash
curl -X POST http://localhost:5004/Blogs/Signup \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Test@1234"
  }'
```

**Expected Response (200):**
```json
{
  "message": "User added successfully",
  "data": { "username": "testuser", "email": "testuser@example.com", ... },
  "tokenis": "<jwt_token>"
}
```

**Error — Duplicate User (404):**
```json
{ "message": "You have already Sigup...!! please Login" }
```

---

## 3. Login (Public)

Login with an existing user. Saves the `tokenis` cookie for subsequent requests.

```bash
curl -X POST http://localhost:5004/Blogs/Login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "Test@1234"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Logged in successfully",
  "token": "<jwt_token>"
}
```

**Error — User Not Found (404):**
```json
{ "error": "User not found" }
```

**Error — Wrong Password (401):**
```json
{ "error": "Password did not match" }
```

---

## 4. Upload Blog (Protected — requires auth cookie)

Create a new blog post with an image (required) and optional audio file.

```bash
curl -X POST http://localhost:5004/Blogs/upload \
  -b cookies.txt \
  -F "Title=My First Blog" \
  -F "Email=testuser@example.com" \
  -F "Blog=This is the content of my first blog post." \
  -F "blogImage=@./path/to/image.jpg" \
  -F "audioFile=@./path/to/audio.mp3"
```

> **Notes:**
> - `blogImage` is **required**. `audioFile` is **optional** — remove that line to skip.
> - Replace `./path/to/image.jpg` and `./path/to/audio.mp3` with real file paths.
> - Accepted audio MIME types: `mpeg`, `wav`, `ogg`, `mp4`, `webm`.

**Expected Response (200):**
```
Blog added Successfully
```

**Error — Missing Image (400):**
```json
{ "message": "Blog image is required" }
```

---

## 5. Get All Blogs (Protected)

Fetch all blog posts.

```bash
curl http://localhost:5004/Blogs/getAllData \
  -b cookies.txt
```

**Expected Response (200):** An array of blog objects:
```json
[
  {
    "_id": "664a...",
    "Title": "My First Blog",
    "Email": "testuser@example.com",
    "BlogID": "testuser@example.com-1",
    "Blog": "This is the content...",
    "Comment": [],
    "imgString": "1719...-image.jpg",
    "audioString": "1719...-audio.mp3",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## 6. Get Single Blog (Protected)

Fetch a specific blog by its MongoDB `_id`. The response status indicates ownership:
- **201** → You are the author
- **202** → You are not the author

```bash
curl http://localhost:5004/Blogs/getSingleUser/<BLOG_MONGO_ID> \
  -b cookies.txt
```

> Replace `<BLOG_MONGO_ID>` with an actual `_id` from step 5.

**Expected Response (201 or 202):**
```json
{
  "_id": "664a...",
  "Title": "My First Blog",
  "Email": "testuser@example.com",
  ...
}
```

**Error — Blog Not Found (404):**
```json
{ "message": "Blog not found" }
```

---

## 7. Get Current User Email (Protected)

Retrieve the email from the JWT token in the cookie.

```bash
curl http://localhost:5004/Blogs/getEmail \
  -b cookies.txt
```

**Expected Response (200):**
```json
{ "email": "testuser@example.com" }
```

**Error — Invalid Token (403):**
```json
{ "message": "Invalid token" }
```

---

## 8. Get Cookie Value (Protected)

Debug endpoint to inspect the raw JWT token stored in the cookie.

```bash
curl http://localhost:5004/Blogs/get-cookie \
  -b cookies.txt
```

**Expected Response (200):**
```json
"<jwt_token_string>"
```

---

## 9. Add Comment to a Blog (Protected)

Add a comment to a blog post by its MongoDB `_id`.

```bash
curl -X PUT http://localhost:5004/Blogs/addComment/<BLOG_MONGO_ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "comment": "Great blog post!"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Comment added successfully",
  "comments": [
    {
      "_id": "...",
      "userId": "...",
      "text": "Great blog post!",
      "createdAt": "..."
    }
  ]
}
```

**Error — Empty Comment (400):**
```json
{ "message": "Comment cannot be empty" }
```

**Error — Blog Not Found (404):**
```json
{ "message": "Blog not found" }
```

---

## 10. Delete a Comment (Protected)

Delete a specific comment from a blog post. Requires both the blog `_id` and the comment `_id`.

```bash
curl -X DELETE http://localhost:5004/Blogs/deleteComment/<BLOG_MONGO_ID>/<COMMENT_ID> \
  -b cookies.txt
```

> Get `<COMMENT_ID>` from the `comments` array returned by step 9 or step 6.

**Expected Response (200):**
```json
{ "message": "Comment deleted successfully" }
```

**Error — Blog Not Found (404):**
```json
{ "message": "Blog not found" }
```

---

## 11. Logout (Protected)

Clears the `tokenis` cookie, ending the session.

```bash
curl http://localhost:5004/Blogs/Logout \
  -b cookies.txt \
  -c cookies.txt
```

**Expected Response (200):**
```
cookie is cleared
```

After logout, any request using `-b cookies.txt` to a protected route should return a **401/403** error.

---

## Recommended Testing Order

Follow this sequence for a complete end-to-end test:

| Step | Endpoint                  | Purpose                         |
|------|---------------------------|---------------------------------|
| 1    | `GET /Blogs/get`          | Verify server is alive          |
| 2    | `POST /Blogs/Signup`      | Create a test account           |
| 3    | `POST /Blogs/Login`       | Login & get auth cookie         |
| 4    | `GET /Blogs/getEmail`     | Confirm auth works              |
| 5    | `POST /Blogs/upload`      | Create a blog post              |
| 6    | `GET /Blogs/getAllData`    | Verify the blog was created     |
| 7    | `GET /Blogs/getSingleUser/:id` | Fetch & check author status |
| 8    | `PUT /Blogs/addComment/:id`    | Add a comment                |
| 9    | `DELETE /Blogs/deleteComment/:id/:commentId` | Delete the comment |
| 10   | `GET /Blogs/Logout`       | End the session                 |
| 11   | `GET /Blogs/getAllData`   | Verify auth is required (expect 401/403) |

---

## Tips

- **Postman Users:** Import the above as a collection. Set the base URL as a variable (`{{base_url}} = http://localhost:5004/Blogs`). Cookies are handled automatically.
- **Thunder Client (VS Code):** Use the same approach — create a collection and let the client handle cookies per domain.
- **Automated Testing:** Consider adding a test framework like **Jest + Supertest** for automated integration tests in CI/CD.
