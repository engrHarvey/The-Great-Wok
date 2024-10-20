### **The Great Wok Project - Project Summary & Features Overview**

#### **Project Overview:**
The Great Wok is a web-based platform designed for a modern Asian restaurant. It offers customers a user-friendly interface to explore the restaurant’s menu, place orders, and leave reviews for dishes. On the backend, the admin interface enables the restaurant management to monitor orders, manage inventory, and track customer reviews. The platform is built using **Next.js** (React framework), with a **PostgreSQL** database, and integrates with several APIs for seamless functionality.

#### **Key Technologies:**
- **Frontend:** Next.js (with React and TypeScript), Tailwind CSS for UI design.
- **Backend:** Node.js with Express.js and PostgreSQL as the database.
- **Authentication:** JSON Web Token (JWT) for user authentication.
- **API Integration:** REST APIs for communication between frontend and backend.

---

### **Features:**

#### **1. User Authentication:**
   - **Signup/Login:**
     - Users can sign up and log in securely using **JWT** authentication.
     - Passwords are hashed and securely stored.
   - **Session Management:**
     - After logging in, users remain authenticated using JWT tokens stored in local storage.
     - Token expiration and logout are handled efficiently.

#### **2. Menu Display:**
   - **Dynamic Menu:**
     - Customers can browse a wide selection of Asian dishes, categorized for easy access (e.g., soups, mains, desserts).
   - **Search and Filter:**
     - A search bar and category filter system are implemented to help users find specific dishes.
   - **Detailed Dish View:**
     - Each dish includes a name, description, price, and image, providing a visually appealing user experience.
   - **Menu Sorting:**
     - The menu items are sorted alphabetically by default for easy navigation.

#### **3. Shopping Cart:**
   - **Add to Cart:**
     - Customers can easily add dishes to their cart directly from the menu.
   - **Cart Management:**
     - Users can increase or decrease the quantity of each dish or remove items from their cart.
   - **Cart Persistence:**
     - The cart data is stored in local storage, ensuring that items remain in the cart even after page refresh or navigation.
   - **Checkout Process:**
     - Users can review their cart and proceed to checkout after logging in.

#### **4. Order Management:**
   - **Order History:**
     - Users can view their past orders, including details such as the total price, date of order placement, and items in the order.
   - **Order Item Reviews:**
     - Each order item has a "Review" button that opens a modal allowing the user to rate and comment on the dish.
     - Users can also edit previously submitted reviews.
   - **Order Status Tracking:**
     - For each order, users can view the status (e.g., "Preparing food," "Ready for pickup").

#### **5. Reviews and Ratings:**
   - **Review Submission:**
     - Users can rate dishes on a 1-5 scale and submit detailed comments after consuming a dish.
   - **Review Management:**
     - Reviews are submitted via a dedicated API endpoint, with proper validation.
   - **Review Editing:**
     - Users can edit their submitted reviews, ensuring up-to-date feedback.

#### **6. Admin Dashboard:**
   - **User Management:**
     - Admins can view and manage all registered users, including banning or deleting accounts.
   - **Order Management:**
     - A detailed view of all orders, including their statuses, items, and customer information.
     - Admins can mark orders as "Done Preparing" via the dashboard.
   - **Inventory Management:**
     - Admins can track available dishes and manage stock levels through an inventory dashboard.
   - **Dish Management:**
     - Admins can add new dishes, modify existing ones, and remove dishes from the menu.
   - **Category Management:**
     - The menu categories can be modified, allowing for the addition or removal of sections based on seasonal or promotional items.
   - **Review Moderation:**
     - Admins can view and moderate all customer reviews to ensure they meet quality standards.
   - **Order Item Management:**
     - Admins have a detailed view of all items ordered across different orders, sorted by the most recent.

#### **7. Notifications:**
   - **Cart Notifications:**
     - A visual notification appears on the cart icon indicating the number of items in the cart.
   - **Order Updates:**
     - Users are notified of order status changes and other key events, such as when an order is ready for pickup.

#### **8. Database Structure:**
   - **Users Table:**
     - Stores information about users, including roles (admin or customer), username, email, and hashed passwords.
   - **Dishes Table:**
     - Stores dish details like name, description, price, and category.
   - **Orders Table:**
     - Stores customer order information, including total price, user ID, and order status.
   - **Order Items Table:**
     - Links orders to dishes and tracks quantities and prices for each ordered item.
   - **Reviews Table:**
     - Stores user reviews, ratings, and comments for each dish, along with timestamps for creation and updates.

#### **9. Performance Optimizations:**
   - **Image Optimization:**
     - The platform uses Next.js **Image Optimization** for better performance, ensuring images are appropriately sized for different devices.
   - **API Efficiency:**
     - REST APIs are designed to fetch only necessary data, with database indexing and efficient queries ensuring fast data retrieval.
   - **Client-Side Caching:**
     - Leveraging Next.js’s caching and pre-fetching mechanisms to minimize page load times.

#### **10. Security Features:**
   - **Authentication:**
     - JWT tokens are used for secure user authentication, with sensitive routes protected by middleware.
   - **Validation:**
     - All user inputs are validated server-side using tools like **express-validator** to prevent malicious data submission.
   - **HTTPS:**
     - The project enforces HTTPS for secure communication between the client and server.

---

### **Conclusion:**
The Great Wok platform is a complete solution for managing both customer-facing interactions (menu browsing, ordering, and reviews) and backend management (user accounts, orders, inventory). The platform's architecture is optimized for scalability, security, and user experience, ensuring a seamless experience for both customers and admins.

With features like dynamic menu management, order tracking, and customer reviews, the Great Wok project stands as a robust and well-rounded system for modern restaurant management.