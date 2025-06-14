# matrix-jobs

Extends the `@sctlib/mwc` component `matrix-room` with the default
filter showing only `today.joblist.job` events in the room.

# Usage

See the reference of the `mwc` component for full documentation.

# Aditionnal usage as widget (on joblist components domain only)

When used from the `components.joblist.today` URL, it is possible to
add the matrix client widget URL Search Parameters, to let the client
let the component know which room to display the job events from (the
current room the widget is in).

For this add the search param to the URL `?roomId=$matrix_room_id` so
the matrix client can replace the `$` prefeix placeolder with a real
value.


For example, use the URL
`https://components.joblist.today/apps/matrix-widget-send-job/?roomId=$matrix_room_id`
inside a matrix room, from a matrix client (element web), to display
all job events in this room (inside the widget).

> In element, a widget can be pinned, and the room layout
> applied/enforced to everyone who visits the room. Nice to use in
> combination with the `matrix-widget-send-job` to read and write jobs
> (cannot entirely CRUD yet).
