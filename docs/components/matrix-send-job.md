# matrix-send-job

A wrapper (does not extend) around matrix-send-event, to display a
"login-to-send-event flow.

If the user is logged in and joined the room will render a send event
with type `today.joblist.job`.

Otherwise it will render a matrix-auth to login, and a matrix-join to
join the room, then render the send event component.

> Note: mmaybe could use the joblist-matrix-send-job-widget, to
> refactor in one; but complex because of widget API race request
