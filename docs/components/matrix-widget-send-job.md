# matrix-widget-send-job

Extends the `@sctlib/mwc` component `matrix-send-event` with the
widget attribute set to `true` and the `event-type` to
`today.joblist.job` and can be used as a mtrix widget in a room.


## Usage

Add the URL of the component's page as a widget to the room, using the
`/addwidget <widget_url>`> matrix client (element web) command.

This method (versus using the "add custom widget" in the client's UI),
allows the widget to **request capabilities** so it can act as the
user through the client.

This component will then allow a user to post the job event type in
the room the widget is in.

> This widget does not require additional search params attributes for
> the matrix widget spec (it is a native client widget asking for its
> own capabilties).
