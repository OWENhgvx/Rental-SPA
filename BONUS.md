# **BONUS.md**

## **Extra Features **

------

### **1. Publish / Unpublish State + Edit Dates**

- After publishing, the button switches green → red, and an **Edit Dates** button appears — this is a newly added feature that allows hosts to adjust availability directly from the card.
   → improves visibility, adds new functionality, and gives immediate feedback.

------

### **2. Login Prompt for Unauthenticated Viewers**

- When a user opens a listing while not logged in, a clear “Please log in” prompt is shown.
   → prevents errors and guides proper user flow.

------

### **3. JSON Import Validation (Structure + Data + Base64)**

- Validates `.json` file type, internal fields (e.g., room count not negative), and Base64 image strings. Counts > 9 shown as **“9+”**.
   → improves data reliability and UI consistency.

------

### **4. Mutually Exclusive Thumbnail Input**

- Thumbnail field merges image upload & YouTube URL; selecting one disables the other.
   → reduces confusion and avoids conflicting inputs.

------

### **5. Auto-Play YouTube Preview on Hover**

- HostListing and Dashboard cards auto-play YouTube preview on hover.
   → enhances feedback and makes content more visible quickly.

------

### **6. 30-Day Income Chart Enhancements**

- Different month segments use different colors; x-axis shows clear date labels.
   → improves readability and trend interpretation.

------

### **7. Date Restrictions for Booking & Availability**

- Users cannot select any date earlier than today.
   → prevents invalid selections and reduces errors.

### **8. Shared Card Component for Host & Guest**

- Both Host and Guest views rely on the same HouseCard component; only the action buttons differ (Guest sees details, Host sees Edit / Publish / Delete).
   → keeps the interface consistent while adapting to different user roles.

