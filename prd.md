# One-Page Next.js CORS Testing Application

## Project Overview
Create a **one-page** Next.js frontend application that allows users to test CORS (Cross-Origin Resource Sharing) on any given URL. The single page should include the following sections:

### 1. Description Section
Provide an explanation covering:
- **What is CORS?**  
  For security, browsers stop scripts from accessing URLs on different domains. CORS (Cross-Origin Resource Sharing) is implemented by examining the HTTP headers returned by a URL. For example, if you are on `google.com` and try to access `example.com/font.ttf`, the browser will only allow the request if `example.com` returns the appropriate CORS header.  
  [Learn more](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

- **What does this site do?**  
  This site will make a test request to the URL you provide and check if it has valid CORS headers. If it does, you should be good to go when using it in a browser. This website is open source and available on GitHub.

- **Which HTTP method should I use?**  
  - **GET:** Use for loading a script, font, or any static resource.
  - **OPTIONS:** Use for sending an AJAX request and checking the preflight request.
  - **PUT / POST:** Provided for other testing purposes.

### 2. User Input Form
Include the following inputs:
- A text input for the **URL**.
- A text input for the **Origin** header.
- A selection control (dropdown or radio buttons) for choosing the **HTTP method** (options: GET, OPTIONS, PUT, POST).
- A **Test** button to initiate the CORS test.

### 3. Result Display
Display the results of the test request, including:
- The request details.
- The response headers (with special attention to CORS-related headers).
- Any errors encountered.

### 4. Share Link Functionality
- After the user clicks the **Test** button and the test request completes (whether successful or not), display a **Share Link** button.
- When clicked, the **Share Link** button should generate a shareable URL that includes the current input parameters (URL, Origin header, and selected HTTP method) as query parameters.
- The generated URL should be automatically copied to the user's clipboard, with a user-friendly notification such as "Link copied to clipboard!".

## Technical Requirements
- The project should be built as a **one-page** Next.js application (using `pages/index.js` as the single page).
- Use functional components along with React hooks (e.g., `useState`, `useEffect`) for state management.
- Use the Fetch API to make HTTP requests.
- Implement appropriate error handling for network requests.
- The UI should be clean and minimal.

## Deliverable
Provide the complete code for the single-page Next.js project that implements the above functionality, including all necessary import statements and components.
