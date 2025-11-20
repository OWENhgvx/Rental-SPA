# TESTING.md

## How to Run the Tests

To run all Cypress tests:

```bash
npm install
npm run test
```

This will start Cypress and allow you to run:

- **E2E tests** (Happy Path & Additional Path)
- **Component tests**

---

## **Component Rationale**

We selected six components that represent core UI responsibilities—filtering, booking, commenting, and listing display. They are reusable, state-driven, and have clear input/output behavior, making them well-suited for isolated component testing.

Each component was mounted in Cypress with necessary wrappers (MantineProvider/Router). Tests covered rendering and interaction, including:

- **BedFilter**: sort toggle, slider display, onCommit.
- **BookingStatusPanel**: logged-out state, empty/multiple bookings, error handling.
- **BookListingBox**: login gating, price calculation, date range, reset.
- **CommentBar**: permission checks, API responses, form UI, character counter.
- **HouseCard**: thumbnail logic, host actions, delete/edit callbacks, publish state.
- **ListingImageDisplay**: single/multiple slides, YouTube, navigation, mixed media.

These tests verify key user-visible behaviors, ensure correct state handling, and help catch regressions early.

---

## Happy Path Rationale
Our UI testing covers a full Happy Path that represents the main end-to-end workflow of admin/host/guest users. This path validates the system’s essential functionality, including:

- **Registration**: New users can sign up and are redirected properly.
- **Listing Creation**: Hosts can create listings with required details.
- **Listing Update**: Editing (thumbnail/title) sends correct PUT requests and updates state.
- **Publish / Unpublish**: Listing availability and state transitions work as expected.
- **Booking**: Guests can select dates and create bookings successfully.
- **Logout & Login**: Session handling and navigation behave correctly.

Overall, this Happy Path ensures that authentication, listing management, availability, and booking all function reliably from start to finish.

------

## Additional Path Rationale
This Additional Path covers guest behaviour **after a booking is created**. It verifies:

- **Guest Login & Browsing**: Guest can log in, load listings, and open a detail page.
- **Booking Polling**: The app continuously polls /bookings and updates UI based on status changes.
- **Acceptance Notification**: When a booking moves from pending to accepted, the guest receives a real-time notification.
- **Logout**: Session data is cleared and the user is redirected to login.

Overall, this path ensures the app correctly handles **post-booking state changes** and **guest-side notifications**.