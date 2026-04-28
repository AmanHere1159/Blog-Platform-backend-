async function testComment() {
    try {
        let loginRes = await fetch('http://localhost:5004/Blogs/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'tester2', password: 'password123' })
        });
        
        if (!loginRes.ok) {
            console.log("Signup first...");
            await fetch('http://localhost:5004/Blogs/Signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'tester2', email: 'tester2@test.com', password: 'password123' })
            });

            loginRes = await fetch('http://localhost:5004/Blogs/Login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'tester2', password: 'password123' })
            });
        }
        
        const setCookieHeader = loginRes.headers.get('set-cookie');
        if (!setCookieHeader) throw new Error("No cookie received on login");
        const token = setCookieHeader.split(';')[0];
        console.log("Logged in!");

        const blogsRes = await fetch('http://localhost:5004/Blogs/getAllData', {
            headers: { 'Cookie': token }
        });
        const blogs = await blogsRes.json();
        
        if (blogs.length === 0) {
            console.log("No blogs found. Creating dummy blog...");
            return;
        }

        const blogId = blogs[0]._id;
        console.log("Adding comment...");
        
        const commentRes = await fetch(`http://localhost:5004/Blogs/addComment/${blogId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': token
            },
            body: JSON.stringify({ comment: "Automated API check for username!" })
        });
        
        const commentData = await commentRes.json();

        const updatedComments = commentData.comments;
        const lastComment = updatedComments[updatedComments.length - 1];
        
        console.log("Latest Comment Output:", JSON.stringify(lastComment, null, 2));

        if (lastComment.userName === 'tester2') {
            console.log("✅ SUCCESS! User name correctly captured and returned as: " + lastComment.userName);
        } else {
            console.log("❌ FAILURE! Username is missing or incorrect: " + lastComment.userName);
            console.log("Entire array:", JSON.stringify(updatedComments, null, 2));
        }
    } catch (e) {
        console.error("Test Error:", e.message);
    }
}
testComment();
