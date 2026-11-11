# Booking calendar and notifications

The audit chatbot on `/free-audit` collects full name, business name, email, phone number, and an optional description in conversation. Once the visitor confirms, a button opens the existing Calendly event with these details pre-filled. The chat is served by `api/chat.ts` (Vercel) and needs the `KOBOILLM_API_KEY` environment variable set in the Vercel project (and in `.env.local` for `npm run dev`). A meeting is booked only after the visitor chooses a time and completes Calendly's confirmation.

The contact page embeds the same event. Both use `CALENDLY_URL` in `src/utils/navigation.ts`.

## Account configuration required before release

The website changes prepare the handoff; they do not configure the Calendly account. Calendar connections, invitee questions, and notification recipients still need to be checked in the event owner's account.

### Match the invitee questions

In Calendly, edit the event at `https://calendly.com/abdulhaadi-businesschat/30min`, open **More options → Invitee form**, and configure the enabled custom questions in this exact order:

| Position | Question | Answer type | Required | Website parameter |
| --- | --- | --- | --- | --- |
| 1 | Business name | One line | Yes | `a1` |
| 2 | Phone number | Phone number | Yes | `a2` |
| 3 | Description | Multiple lines | No | `a3` |

Keep Calendly's built-in full-name and email fields. Check existing custom questions before changing their order; if other questions must remain, update `CALENDLY_QUESTIONS` in `src/utils/navigation.ts` to match their actual positions. Calendly will only store pre-filled custom answers when the corresponding questions exist and are enabled.

Reference: [Pre-fill invitee information](https://calendly.com/help/how-to-pre-fill-invitee-information-in-your-calendly-link), [Add or remove invitee questions](https://calendly.com/help/how-to-add-or-remove-invitee-questions).

### Connect the host calendar

1. In the event owner's Calendly account, open the calendar settings and connect the intended Google or Microsoft calendar account.
2. Select calendars to check for conflicts and the calendar to add new events to.
3. Set the host's availability and timezone, and review the event's meeting location and duration.
4. Prefer Calendar invitations for supported connected calendars so invitees receive calendar updates.

References: [Connect your calendar](https://calendly.com/help/connect-your-calendar-to-calendly), [Scheduling notifications](https://calendly.com/help/calendly-scheduling-notifications).

### Booking notifications

Calendly sends its host a booking confirmation at the account's login email address. Custom invitee answers are included by default. Confirm that this is the inbox that should receive alerts.

For additional recipients, use an **Email someone else** Automation when the account's plan supports it, or configure a forwarding rule in the host's email account. Do not add notification recipients as meeting guests merely to send alerts.

References: [Multiple calendars and email addresses](https://calendly.com/help/how-to-manage-multiple-calendars-and-email-addresses), [Host booking confirmations](https://calendly.com/help/why-am-i-not-receiving-calendly-email-confirmations).

## End-to-end verification

After the account settings are saved, make an authorized test booking using a test email inbox:

1. Complete the chatbot conversation with a business name, an international phone number, and a multi-line description.
2. Choose a time in Calendly and verify every field is pre-filled in the correct question before confirming.
3. Verify the meeting appears in Calendly and the intended host calendar, with all submitted details.
4. Verify the host and any configured notification recipients receive the booking email.
5. Cancel the test booking and verify the calendar updates.

Passing the local build and URL tests does not verify calendar syncing or email delivery. No real test booking has been made as part of the website-only changes.
